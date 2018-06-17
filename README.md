
# 8slp-node

  **[WORK IN PROGRESS]**

Eight Smart Matress (Unofficial) - Node Api Integration.

No dependencies.

8slp requires [Node.js](https://nodejs.org/) v8+ to run.

Inspired by [Smart Things](https://github.com/alyc100/SmartThingsPublic/blob/master/devicetypes/alyc100/eight-sleep-mattress.src/eight-sleep-mattress.groovy).

    const EightClient = require('8slp-node');
    (...)
    const eightClient = await EightClient.create('email@foo.com', 'password');

 - presenceEnd()
 - leftPresenceEnd()
 - rightPresenceEnd()
 - presenceStart()
 - leftPresenceStart()
 - rightPresenceStart()
 - sleepEnd()
 - sleepStart(): TODO
 - leftSleepEnd()
 - leftSleepStart(): TODO
 - rightSleepStart(): TODO
 - rightSleepEnd()

# TODO
- Set temperature level;
- Level up;
- Level down;
- Get temperature level;
- Set heat duration;
- Heating duration down;
- Heating duration up;
- Get latest sleep score
- Monitor temperature
- Debug mode