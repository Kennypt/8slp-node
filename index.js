const client = require('./client');
const Session = require('./session');

const MIN_TEMPERATURE_VALUE = 15;

class EightClient {
    constructor(session, deviceId, isOwner, rightSide, leftSide, online, timezone) {
        this.session = session;
        this.deviceId = deviceId;
        this.rightSide = rightSide;
        this.leftSide = leftSide;
        this.online = online;
        this.timezone = timezone;
    }

    static async create(email, password) {
        let deviceId, rightSide, leftSide, online, timezone;
        const session = await Session.create(email, password);

        // Get device id
        const resUserMe = await client.getUserMe(session);
        if (resUserMe && resUserMe.user && resUserMe.user.devices && resUserMe.user.devices.length) {
            deviceId = resUserMe.user.devices[0];
            timezone = esUserMe.user.timezone;
            
            await refreshBedSidesData(this);
        }

        return new EightClient(session, deviceId, rightSide, leftSide, online, timezone);
    }

    async leftSideWokeUp() {
        return await userWokeUp(this.session, this.timezone, this.leftSide.userId);
    }

    async rightSideWokeUp() {
        return await userWokeUp(this.session, this.timezone, this.rightSide.userId);
    }

    async leftIsSleeping() {
        if(!refreshBedSidesData(this.session, this.deviceId)) {
            return false;
        }

        return this.leftSide.heatingLevel > MIN_TEMPERATURE_VALUE;
    }

    async rightIsSleeping() {
        if (!refreshBedSidesData(this.session, this.deviceId)) {
            return false;
        }

        return this.rightSide.heatingLevel > MIN_TEMPERATURE_VALUE;
    }

    isSessionValid() {
        return this.session && this.session.isValid();
    }
}

function buildSideData(side, data) {
    return {
        userId: data[`${side}UserId`],
        heatingLevel: data[`${side}HeatingLevel`],
        targetHeatingLevel: data[`${side}TargetHeatingLevel`],
        nowHeating: data[`${side}NowHeating`],
        heatingDuration: data[`${side}HeatingDuration`],
        presenceStart: data[`${side}PresenceStart`],
        presenceEnd: data[`${side}PresenceEnd`],
        schedule: data[`${side}Schedule`],
        isOwner: data[`${side}UserId`] === data.ownerId
    };
}

async function refreshBedSidesData(self) {
    const resUser = await client.getUserById(self.session, self.deviceId);
    if (!resUser || !resUser.result) {
        return false;
    }

    self.leftSide = buildSideData('left', resUser.result);
    self.rightSide = buildSideData('right', resUser.result);
    self.online = resUser.result.online;

    return true;
}

async function userWokeUp(session, timezone, userId) {
    const from = getDate(timezone, -1).format('YYYY-MM-DD');
    const to = getDate(timezone).format('YYYY-MM-DD');

    const res = await client.getTrendsByUserId(session, userId, timezone, from, to);

    if (res && res.days && res.days.length) {
        const sleepEnd = res.days[0].sleepEnd;
        if (sleepEnd && (new Date(sleepEnd).getTime() - getDate(timezone).getTime() > 0)) {
            return true;
        }
    }

    return false;
}

function getDate(timezone, daysOffset = 0) {
    if (daysOffset === 0) {
        return new Date();
    }
    return new Date((new Date()).setDate(myDate.getDate() + daysOffset));
}

module.exports = EightClient;