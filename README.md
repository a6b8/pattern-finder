![CircleCI](https://img.shields.io/circleci/build/github/a6b8/patternFinder/main)


# Pattern Finder

```
█▀█ ▄▀█ ▀█▀ ▀█▀ █▀▀ █▀█ █▄░█   █▀▀ █ █▄░█ █▀▄ █▀▀ █▀█
█▀▀ █▀█ ░█░ ░█░ ██▄ █▀▄ █░▀█   █▀░ █ █░▀█ █▄▀ ██▄ █▀▄
```


Dieses Modul hilft um Mustern in Zeichenketten zu finden. Es kann eingesetzt werden um bestimmte Muster in Private Keys  zu finden, die visuell helfen die Adresse leichter wiederzufinden.


## Quickstart

```
npm i patternfinder
```

```js
import { PatternFinder } from 'patterfinder'
const patternFinder = new PatternFinder()
const result = patternFinder
    .getResult( { 
        'str': '0000abcdefghijklmnop00000', 
        'presetKey': 'startsAndEndsWithZeros',
        'flattenResult': false
    } )
console.log( JSON.stringify( result, null, 4 ) )
```


## Table of Contents

- [Pattern Finder](#pattern-finder)
  - [Quickstart](#quickstart)
  - [Table of Contents](#table-of-contents)
  - [Methods](#methods)
    - [getPresetKeys()](#getpresetkeys)
    - [getResult()](#getresult)
    - [setPreset()](#setpreset)
  - [Challenges](#challenges)
  - [License](#license)



## Methods

Das Modul hat die Hauptmethode `.getResults()` die über vorgefertigte Presets in wenigen Zeilen, eine Zeichenkette bearbeitet. Über `getPresetKeys()` kann man alle eingelesenen PresetKeys abfragen. Über `setPreset()` ein eigenes Preset erstellen. Was dann über `.getResults()` verfügbar ist.


### getPresetKeys()

Diese Methode gibt alle verfügbaren Presets zurück, auch die jenigen die über `.setPresets()` später hinzugefügt wurden.

```
.getPresetKeys()
```

```js
import { PatternFinder } from 'patterfinder'
const patternFinder = new PatternFinder()
const presetKeys = patternFinder.getPresetKeys()
console.log( `Available PresetsKeys: ${presetKeys.join( ', ' )}` )
```


### getResult()

```
.getResult( { str, presetKey, flattenResult=false } ) 
```


| Key               | Type      | Description                         | Required |
| ----------------- | --------- | ----------------------------------- | -------- |
| str               | `String`  | Hier wird die zu analysierende Zeichenkette abgelegt. | `true`   |
| presetKey     | `String` | Hier wird das zu benutzende Preset ausgewählt.     | `true`  |
| flattenResult     | `Object`, `Boolean` | Hier kann mit dem überschreiben den `default` values eine detailierte Resultatsangebe erzwungen werden. Je nach Methode zum Beispiel `inSuccession` werden dann auch noch zusatzinformationen verfügbar.     | `true`  |


```js
import { PatternFinder } from 'patterfinder'
const patternFinder = new PatternFinder()
const result = patternFinder
    .getResult( { 
        'str': '0000abcdefghijklmnop00000', 
        'presetKey': 'startsAndEndsWithZeros',
        'flattenResult': false
    } )
console.log( JSON.stringify( result, null, 4 ) )
```


### setPreset()

Diese Methode macht es möglich eigenen Challenges vorzuladen. So das sie über `getResult` erreichbar werden.

```
.setPreset( { presetKey, challenge } )
```


| Key               | Type      | Description                         | Required |
| ----------------- | --------- | ----------------------------------- | -------- |
| presetKey         | `String`  | Erwartet den `key` unter der die Challenge zu finden ist. | `true`   |
| challenge     | `Object` | In diesem Object sind alle Informationen abgelegt um eine Challenge durchzuführen. Siehe auch [./src/data/presets.mjs](./src/data/presets.mjs) abgelegt.     | `true`  |




```js
import { PatternFinder } from 'patterfinder'
const patternFinder = new PatternFinder()
const preset = {
    'presetKey': 'customPreset',
    'challenge':         {
        'logic': {
            'and': [
                {
                    'value': '0',
                    'description': 'Search for a given characters.',
                    'method': 'inSuccession',
                    'option':  'startsWith', // 'inBetween', // 'endsWith',
                    'expect': {
                        'logic': '>=',
                        'value': 2
                    }
                }
            ]
        }
    }
}

const search = '000abcdefghi'
const result = patternFinder
    .setPreset( preset )
    .getResult( { 
        'str': search, 
        'presetKey': 'customPreset',
        'flattenResult': true
    } )

console.log( JSON.stringify( result, null, 4 ) )
```


## Challenges

Ein Preset besteht aus einem Namen `presetKey`, einer `description` (optional) und dem eigentlichen `logic` bereich.

| Operator  | Beschreibung                                  |
| --------- | -------------------------------------------- |
| `and`     | Erfordert, dass alle Muster gefunden werden. |
| `or`      | Erfordert, dass mindestens ein Muster gefunden wird. |

Folgende Grundoperatoren sind verfügbar: `and` und `or`. `and` erwartet das alle pattern gefunden werden, `or` erwartet das mindestens ein pattern gefunden wird.

| Suchweise         | Beschreibung                                                                                                       | Options | Logic |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ | ------ | ----- |
| `regularExpression` | Ermöglicht komplexe Suchmuster mithilfe regulärer Ausdrücke.                                                       |        |  `=`     |
| `inSuccession`     | Ermöglicht das Zählen gleicher Zeichen am Anfang, Ende oder irgendwo im Text und den Vergleich mit einer Zahl. | `startsWith`, `endsWith`, `inBetween`    | `=`, `>`, `>=`, `<`, `<=`       |


Es gibt bisher 2 verschiedene grundsätzliche Suchweise `regularExpression` und `inSuccession`. Über regular Expression lässt sich eine hohe Komplexität erreichen. Mit `inSuccession` lassen sich gleiche Zeichen vom Anfang `startsWith`, vom Ende `endsWith` oder irgendwo im Text zählen. Über den key `expect.value` lässt sich dann eine Zahl festlegen und mit `expect.logic` der vergleichsoperator.

Diese einzelnen Pattern lassen sich wie oben dann beschrieben über `and` und `or` gruppieren und über die Zusatzfunktion in `getResults( {... flattenResults: 'true' } )` vereinfacht mit einem Boolean Wert ausgegeben.


In diesem Beispiel wird nach `0` gesucht die in Reihenfolge am Anfang des Strings sind. Wenn es mindestens 2 sind wird es als `true` gewertet
```js
const preset = {
    'presetKey': 'customPreset',
    'challenge': {
        'logic': {
            'and': [
                {
                    'value': '0',
                    'description': 'Search for a given characters.',
                    'method': 'inSuccession',
                    'option':  'startsWith', // 'inBetween', // 'endsWith',
                    'expect': {
                        'logic': '>=',
                        'value': 2
                    }
                }
            ]
        }
    }
}
```


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.