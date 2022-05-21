const fs = require('fs');

/**
 * Format stringify before writing to a profile (call once for each profile)
 * 
 * From .editorconfig
 * end_of_line = lf
 * insert_final_newline = true
 * indent_style = tab
 * indent_size = 2
 */
const formatStringify = combinedObject => JSON.stringify(combinedObject, null, "\t") + '\n';

/**
 * Copy N90 and PHL profiles as-is
 */
function copyN90PHLProfiles() {
    Promise.all(
        fs.readdirSync('source/').filter(filename => filename.match('vATIS-v4_(N90_[A-Z]{3}|PHL).json')).map(filename => {
            fs.promises.copyFile(`source/${filename}`, `build/${filename}`)
        })
    ).then(_ => {
        console.log('Built all N90+PHL profiles!')
    })
}

/**
 * Build N90 Combined profile from LGA, JFK, ISP, and EWR
 */
function buildN90CombinedProfile() {
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
        let combinedObject = {
            "Name": "N90 Combined",
            "Composites": Array.prototype.concat(...values)
        }

        fs.writeFileSync(`build/vATIS-v4_${combinedObject.Name.replace(' ', '_')}.json`,
            formatStringify(combinedObject), 'utf8', 'rw');
    })
}

/**
 * Build Minor profiles
 */
function buildMinorProfiles() {
    /**
     * Elmira
     */
    let elm = fs.promises.readFile('source/minor/vATIS-v4_KELM.json', 'utf8').then(data => {
        return Promise.resolve(JSON.parse(data).Composites[0])
    });

    let ith = fs.promises.readFile('source/minor/vATIS-v4_KITH.json', 'utf8').then(data => {
        return Promise.resolve(JSON.parse(data).Composites[0])
    });

    Promise.all([elm, ith]).then(values => {
        let combinedObject = {
            "Name": "ZNY Elmira",
            "Composites": Array.prototype.concat(...values)
        }

        fs.writeFileSync(`build/minor/vATIS-v4_${combinedObject.Name.replace(' ', '_')}.json`,
            formatStringify(combinedObject), 'utf8', 'rw');

        console.log(`Built ${combinedObject.Name} profile!`)
    })

    /**
     * Harrisburg 
     * TODO: create CXY profile/composite
     */

    let mdt = fs.promises.readFile('source/minor/vATIS-v4_KMDT.json', 'utf8').then(data => {
        return Promise.resolve(JSON.parse(data).Composites[0])
    });

    let lns = fs.promises.readFile('source/minor/vATIS-v4_KLNS.json', 'utf8').then(data => {
        return Promise.resolve(JSON.parse(data).Composites[0])
    });

    Promise.all([mdt, lns]).then(values => {
        let combinedObject = {
            "Name": "ZNY Harrisburg",
            "Composites": Array.prototype.concat(...values)
        }

        fs.writeFileSync(`build/minor/vATIS-v4_${combinedObject.Name.replace(' ', '_')}.json`,
            formatStringify(combinedObject), 'utf8', 'rw');

        console.log(`Built ${combinedObject.Name} profile!`)
    })

    /**
     * ZNY Others
     */

    let abe = fs.promises.readFile('source/minor/vATIS-v4_KABE.json', 'utf8').then(data => {
        return Promise.resolve(JSON.parse(data).Composites[0])
    });

    let bda = fs.promises.readFile('source/minor/vATIS-v4_TXKF.json', 'utf8').then(data => {
        return Promise.resolve(JSON.parse(data).Composites[0])
    });

    let bgm = fs.promises.readFile('source/minor/vATIS-v4_KBGM.json', 'utf8').then(data => {
        return Promise.resolve(JSON.parse(data).Composites[0])
    });

    let rdg = fs.promises.readFile('source/minor/vATIS-v4_KRDG.json', 'utf8').then(data => {
        return Promise.resolve(JSON.parse(data).Composites[0])
    });

    let avp = fs.promises.readFile('source/minor/vATIS-v4_KAVP.json', 'utf8').then(data => {
        return Promise.resolve(JSON.parse(data).Composites[0])
    });

    Promise.all([abe, bda, bgm, rdg, avp]).then(values => {
        let combinedObject = {
            "Name": "ZNY Others",
            "Composites": Array.prototype.concat(...values)
        }

        fs.writeFileSync(`build/minor/vATIS-v4_${combinedObject.Name.replace(' ', '_')}.json`,
            formatStringify(combinedObject), 'utf8', 'rw');

        console.log(`Built ${combinedObject.Name} profile!`)
    })
}

copyN90PHLProfiles();
buildN90CombinedProfile();
buildMinorProfiles();
