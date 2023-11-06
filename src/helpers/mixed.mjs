function regexToString( key, value ) {
    if( value instanceof RegExp ) {
        return value.toString()
    }
    return value
}


function stringToRegex( key, value ) {
    let regex = null
    if( /^\/.*\/[gimy]*$/.test( value ) ) {
        try {
            new RegExp( value )
            regex = true
        } catch (error) {
            regex = false
        }
    } else {
        regex = false
    }

    if( regex ) {
        return new RegExp( value.slice( 1, -1 ) )
    } else {
        return value
    }
}


export { regexToString, stringToRegex }