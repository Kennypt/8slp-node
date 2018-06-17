
# 8slp-node

  **[WORK IN PROGRESS]**

Eight Smart Matress (Unofficial) - Node Api Integration.

No dependencies.

8slp requires [Node.js](https://nodejs.org/) v8+ to run.

Inspired by [Smart Things](https://github.com/alyc100/SmartThingsPublic/blob/master/devicetypes/alyc100/eight-sleep-mattress.src/eight-sleep-mattress.groovy).

    const EightClient = require('8slp-node');
    (...)
    const eightClient = await EightClient.create('email@foo.com', 'password');

 - presenceEnd(): Both left and right sides have left bed.
 - leftPresenceEnd(): Left side has left bed.
 - rightPresenceEnd(): Right side has left bed.
 - presenceStart(): Both left and right sides are in bed.
 - leftPresenceStart(): Left side is in bed.
 - rightPresenceStart(): Right side is in bed.
 - sleepEnd(): Both left and right sides are awake (might still be in bed).
 - sleepStart(): [TODO] Both left and right sides are sleeping.
 - leftSleepEnd(): Left side is awake.
 - leftSleepStart(): (TODO) Left side is sleeping.
 - rightSleepStart(): (TODO) Right side is sleeping.
 - rightSleepEnd(): Right side is awake.

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