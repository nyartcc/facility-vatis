const fs = require('fs');

// Create N90 Combined Profile

let lga = fs.promises.readFile('source/vATIS-v4_N90_LGA.json', 'utf8').then(data => {
    return Promise.resolve(JSON.parse(data).Composites.filter(comp => comp.Identifier == 'KLGA'))
});

let jfk = fs.promises.readFile('source/vATIS-v4_N90_JFK.json', 'utf8').then(data => {
    return Promise.resolve(JSON.parse(data).Composites.filter(comp => comp.Identifier == 'KJFK'))
});

let isp = fs.promises.readFile('source/vATIS-v4_N90_ISP.json', 'utf8').then(data => {
    return Promise.resolve(JSON.parse(data).Composites.filter(comp => comp.Identifier == 'KISP'))
});

let ewr = fs.promises.readFile('source/vATIS-v4_N90_EWR.json', 'utf8').then(data => {
    return Promise.resolve(JSON.parse(data).Composites.filter(comp => comp.Identifier == 'KEWR'))
});

Promise.all([lga, jfk, isp, ewr]).then(values => {
    let N90CombinedObject = {
        "Name": "N90 Combined",
        "Composites": Array.prototype.concat(...values)
    }

    fs.writeFileSync('source/vATIS-v4_N90_Combined.json', JSON.stringify(N90CombinedObject, null, 4), 'utf8', 'rw');
})

/**
 * TODO: Convert remaining minor airports into their own profiles (one composite for each profile).
 * TODO: Write rules to extract and combine minor composites into profile by minor area or by center area.
 */
