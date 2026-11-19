const fs = require('node:fs');

const stationTypes = {
    Arrival:"_A",
    Departure:"_D",
    Combined:""
};

/*
App flow:
Read all stations in directory then:
for each defined profile in config file:
    add station to profile
export profiles
*/
(async() => {
    var allStationsList = await listStations();
    const config = await loadConfigFile();
    
    for (const [name, airports] of Object.entries(config.profiles))
    {
        //read empty profile
        readProfile(name).then((profile) => {
            //if the profile skeleton could not be loaded, don't do anything
            if (typeof profile === 'undefined') return;
            var missedStations = 0;
            for(var i=0; i < airports.length; i++)
            {
                if(airports[i] in allStationsList)
                {
                    allStationsList[airports[i]].ordinal = i - missedStations;
                    profile.stations[i-missedStations] = allStationsList[airports[i]];
                } else {
                    console.error(`Station ${airports[i]} not found. Not added to profile ${name}`);
                    missedStations++;
                }
            }
            //set recursive flag to remove error if directory exists
            fs.promises.mkdir("output",{recursive:true}).then(fs.promises.writeFile(`output/vATIS Profile - ${config.prefix + name}.json`,JSON.stringify(profile,null,2)));
        });
    }
})()

/**
 * Read and parse all station files in starting directory.
 * @returns Map [station name, parsed station Object]
 */
async function listStations() {
    //read all files in directory
    const fileList = await fs.promises.readdir(".",{withFileTypes:true});
    var result = await Promise.all(
        fileList
            //only match files that end with .station
            .filter((dirent) => {return dirent.isFile() && dirent.name.endsWith(".station")})
            //for each station, return station identifier + parsed station
            .map(async (file) => {
                const station = JSON.parse(await fs.promises.readFile(file.name));
                return [station.identifier + stationTypes[station.atisType], station];
            })
        );
    return Object.fromEntries(result);
}
/**
 * Read config file
 * @returns Parsed Config file
 */
async function loadConfigFile() {
    return JSON.parse(await fs.promises.readFile(".github/build/config.json"));
}

/**
 * Read profile skeleton from profiles folder, and parse
 * @param {*} profileName Name of profile to load
 * @returns profileJson object, with updated updateSerial
 */
async function readProfile(profileName) {
    try
    {
        const rawProfile = await fs.promises.readFile(`profiles/${profileName}.json`);
        var profileJson = JSON.parse(rawProfile);

        profileJson.updateSerial = updateSerial();
        profileJson.stations = [];
        return profileJson;
    } catch (e) {
        console.error(`Could not find profile ${profileName}.json`);
    }
    
}
/**
 * Genrate an updateSerial for the current date
 * @returns number serial of current date & time
 */
function updateSerial() {
    const date = new Date(),
          year = date.getFullYear().toString(),
// WHY is getMonth 0 indexed????  vv
          month = (date.getMonth()+1).toString().padStart(2,"0"),
          day = date.getDate().toString().padStart(2,"0"),
          hours = date.getHours().toString().padStart(2,"0");
    return +(year + month + day + hours);
}
