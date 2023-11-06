import { defaultChallenges } from './data/challenges.mjs'
import { regexToString, stringToRegex } from './helpers/mixed.mjs'


export class PatternFinder {
    #config
    #challenges
    #patterns
    #debug
    

    constructor( debug=false ) {
        this.#debug = debug
        this.#config = {}
    }


    #init() {
        this.#patterns = {
            'challenges': [],
            'patterns': []
        }

        this.#addPatternsTemplate()

        return true
    }


    setChallenges( { challenges, pattern } ) {
        this.#debug ? console.log( `PATTERN FINDER` ) : '' 

        let defaultSearch = false
        if( challenges === undefined ) {
            defaultSearch = true
            challenges = defaultChallenges['default']
            challenges[ 0 ]['logic'][ 0 ]['value'] = pattern
        }

        const [ messages, comments ] = this.#validateChallenges( { challenges, pattern, defaultSearch } )
        this.#printValidation( { messages, comments } )

        this.#challenges = challenges
        this.#init()

        return this
    }

/*
    setSimplePattern( { pattern=null } ) {
        this.#debug ? console.log( ' - Activate Default Challenges' ) : ''
        if( typeof( pattern ) !== 'string' ) {
            throw new Error( `  Variable pattern "${pattern}" is not type string` )
        }

        const defaultChallenges = JSON.parse( 
            JSON.stringify( this.#config['challenges']['default'] ) 
        )

        defaultChallenges[ 0 ]['logic'][ 0 ]['value'] = pattern
       // this.#patternFinder.setChallenges( { 'challenges': defaultChallenges } )

        return this
    }
*/

    setPatterns( { str } ) {
        const [ messages, comments ] = this.#validateString( { str } )
        this.#printValidation( { messages, comments } )

        const cmds = this.#patterns['cmds']
            .reduce( ( acc, cmd, index ) => {
                const key = index + ''
                switch( cmd['method'] ) {
                    case 'inSuccession':
                        acc[ key ] = this.patternsInSuccession( { 
                            'str': str,
                            'option': cmd['option'], 
                            'value': cmd['value'],
                            'expect': cmd['expect']
                        } )
                        // results.push( acc[ key ]['success'] )
                        break
                    case 'regularExpression': 
                    console.log( 'HERE', cmd['value'])

                    
                        let reg
                        if( cmd['value'] instanceof RegExp ) {
                            console.log( '- A')
                            reg = cmd['value']
                        } else {
                            console.log( '- B')
                            reg = new RegExp( cmd['value'] )
                        }
                    

                        const test = str.match( reg )
                        acc[ key ] = {
                            'value': ( test !== null ),
                            'success': null
                        }

                        acc[ key ]['success'] = acc[ key ]['value'] === cmd['expect']['value']

                        console.log( '>>>', str )
                        console.log( '>>>', acc[ key ] )
                        console.log( '>>>', cmd )
                        console.log( '>>>', acc[ key ]['success'] )
                        console.log( '----' )
                        // results.push( acc[ key ]['success'] )
                        break
                    default:
                        this.printMsg( { 
                            'type': 'error', 
                            'str': `Key "${cmd['method']}" not found` 
                        } )
                        break
                }

                return acc
            }, {} )

        const struct = this.#challenges
            .reduce( ( acc, a, index ) => {
                acc[ a['name'] ] = {
                    'success': false
                }

                acc[ a['name'] ]['success'] = a['patternIds']
                    .every( id => cmds[ `${id}` ]['success'] )

                return acc
            }, {} )

        const test = Object
            .entries( struct )
            .map( a => a[ 1 ]['success'] )
            .some( a => a )

        struct['found'] = { 
            'success': test
        }

        return struct
    }


    #validateString( { str } ) {
        let messages = []
        let comments = []

        if( typeof str !== 'string' ) {
            messages.push( `Key "str" is not type "string"` )
        }

        return [ messages, comments ]
    }


    #validateChallenges( { challenges, pattern, defaultSearch } ) {
        let comments = []
        let messages = []

        if( defaultSearch ) {
            comments.push( `Activate default search` ) 

            if( typeof pattern === 'string' ) {
                comments.push( `  Set key "pattern" to string "${pattern}"` )
            } else if( pattern instanceof RegExp ) {
                comments.push( `  Set key "pattern" as regular expression ${pattern}` )
            } else if( pattern === undefined ) {
                messages.push( `Key "pattern" is not set, please use "string" or /regular_expression/` )
            } else {
                messages.push( `Key "pattern" has wrong type (${typeof pattern})` )
            }
        } else {
            comments.push( `Activate custom search.` )
        }

        if( challenges === undefined ) {
            if( pattern === undefined ) {
                messages.push( `Key "challenges" is required or use key "pattern" to use default.` )
            }
        } else {
            if( !Array.isArray( challenges ) ) {
                messages.push( `Key "challenges" is not type "array".`)
            } else {
                if( challenges.length === 0 ) {
                    messages.push( `Key "challenges" has length "0".` )
                } else {
                    challenges
                        .map( ( challenge, index ) => {
                            return this.#validateChallenge( { challenge, index } )
                        } )
                        .flat( 1 )
                        .forEach( msg => messages.push( msg ) )
                }
            }
        }

        return [ messages, comments ]
    }


    #validateChallenge( { challenge, index } ) {
        let messages = []

        if( typeof challenge !== 'object' || challenge === null ) {
            messages.push( `[${index}] challenge is not type object` )
        }
    
        if( typeof challenge['name'] !== 'string' || challenge['name'] === '' ) {
            messages.push( `[${index}] key "name" is not type "string" `)
        }
    
        if( !Array.isArray( challenge['logic'] ) ) {
            messages.push( `[${index}] key "logic" is not type "array"` )
        } else {
            challenge['logic']
                .forEach( ( logicItem, rindex ) => {
                    let msgs = this.#validateLogic( { logicItem, index, rindex } )
                    messages = [ ...messages, ...msgs ]
                } )
        }

        return messages
    }


    #validateLogic( { logicItem, index, rindex } ) {
        let messages = []

        let id = `[${index}]['logic'][${rindex}]`

        if (
            typeof logicItem !== 'object' ||
            logicItem === null ||
            !( 'value' in logicItem ) ||
            !( 'method' in logicItem ) ||
            // !( 'option' in logicItem ) ||
            !( 'expect' in logicItem )
        ) {
            messages.push( `${id} keys missing "value", "method", "expect".` )
        }

        if( typeof logicItem['value'] !== 'number' && 
            typeof logicItem['value'] !== 'string' &&
            !( logicItem['value'] instanceof RegExp )
        ) {
            messages.push( `${id} key value is not type string, number or regular expression` )
        }
    
        if( logicItem['method'] !== 'regularExpression' && logicItem['method'] !== 'inSuccession' ) {
            messages.push( `${id} value of key "method" is not "regularExpression" or "inSuccession"` )
        }

        if( Object.hasOwn( logicItem, 'option') ) {
            if( logicItem['option'] !== 'startsWith' && logicItem['option'] !== 'endsWith' ) {
                messages.push( `${id} value of key "option" is not "startsWith" or "endsWith"` )
            }
        }
    
        if (
            typeof logicItem['expect'] !== 'object' ||
            !( 'logic' in logicItem['expect'] ) ||
            !( 'value' in logicItem['expect'] ) ||
            ( typeof logicItem['expect']['value'] !== 'boolean' && typeof logicItem['expect']['value'] !== 'number' )
        ) {
            messages.push( `${id} key "expect" is not type object` )
        }

        return messages
    }


    #patternsInSuccession( { str, option, value, expect } ) {
        str = str.substring( 2, str.length )
        let zeros = 0
        let loop = true
        while( loop ) {
            let search

            switch( option ) {
                case 'startsWith':
                    search = str.substring( 0, 1 )
                    str = str.substring( 1, str.length )
                    break
                case 'endsWith':
                    search = str.substring( str.length - 1, str.length )
                    str = str.substring( 0, str.length - 1 )
                    break
                case 'inBetween':
                    break
            }

            if( search !== '' ) {
                ( search === value ) ? zeros++ : loop = false
            } else {
                loop = false
            }
        }

        const result = {
            'value': zeros,
            'success': null
        }

        switch( expect['logic'] ) {
            case '=':
                result['success'] = ( zeros === expect['value'] ) ? true : false
                break
            case '>':
                result['success'] = ( zeros > expect['value'] ) ? true : false
                break
            case '>=':
                result['success'] = ( zeros >= expect['value'] ) ? true : false
                break
            case '<':
                result['success'] = ( zeros < expect['value'] ) ? true : false
                break
            case '<=':
                result['success'] = ( zeros <= expect['value'] ) ? true : false
                break
            default:
                this.printMsg( { 
                    'type': 'error', 
                    'str': `Logic "${expect['logic']}" is not known.` 
                } )
                break
        }
        
        return result
    }


    #addPatternsTemplate() {
        const patterns = this.#challenges
            // .filter( a => a['active'] )
            .reduce( ( acc, a, index ) => {
                a['logic']
                    .forEach( pattern => {
                        acc.push( pattern )
                    } )
                return acc
            }, [] )
            .map( a => {
                return Object
                    .keys( a )
                    .sort()
                    .reduce( ( abb, key ) => { 
                        abb[ key ] = a[ key ] 
                        return abb
                    }, {} )
            } )
            .map( a => {
                const struct = JSON.stringify( a, regexToString )
                console.log( '>>', struct )
                // console.log( '>>>', struct )
                // struct['value'] = a['value']
                return struct
            } )
            .filter( ( v, i, a ) => a.indexOf( v ) === i )


        this.#challenges = this.#challenges
            // .filter( a => a['active'] )
            .reduce( ( acc, challenge, index ) => {
                const struct = {
                    'name': challenge['name'],
                    'patternIds': []
                }

                challenge['logic']
                    .forEach( a => {
                        let search = Object
                            .keys( a )
                            .sort()
                            .reduce( ( abb, key ) => { 
                                abb[ key ] = a[ key ] 
                                return abb
                            }, {} )
                        search = JSON.stringify( search )
                        const id = patterns
                            .findIndex( a => a === search )

                        struct['patternIds'].push( id )
                    } )

                acc.push( struct )
                return acc
            }, [] )

        this.#patterns['cmds'] = patterns
            .map( a => JSON.parse( a, stringToRegex ) )


/*

        const cmds = [ 'inSuccession', 'regexs' ]
            .reduce( ( acc, method, index ) => {
                this.config['patterns'][ method ]
                    .filter( a => a['active'] )
                    .forEach( a => {
                        const cmd = { ...a }
                        cmd['method'] = method
                        const names = []
                        names.push( method )
                        a.hasOwnProperty( 'option' ) ? names.push( a['option'] ) : ''
                        names.push( a['keyName'] )
                        cmd['outputKey'] = names
                            .join( this.config['patterns']['splitter'] )

                        acc.push( cmd )
                    } )

                return acc
            }, [] )

        console.log( 'cmds', cmds )
        process.exit( 1 )
    */
        return true
    }


    #printValidation( { messages, comments } ) {
        this.#debug ? comments.forEach( msg => console.log( `  ${msg}` ) ) : ''

        messages
            .forEach( ( msg, index, all ) => {
                if( index === 0 ) { 
                    console.log()
                    console.log( `Following Error${all.length > 1 ? 's' : ''} occured:` )
                }
                console.log( `- ${msg}` )
            } )

        messages.length !== 0 ? process.exit( 1 ) : ''

        return true
    }
}