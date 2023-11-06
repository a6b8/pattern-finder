import { PatternFinder } from './../src/PatternFinder.mjs'


const patternFinder = new PatternFinder( true )

patternFinder
    .setChallenges( { 'pattern': /wwwwabcqqq/ } )

const result = patternFinder
    .setPatterns( { 'str': 'wwwwcqqq' } )

console.log( 'result', result )