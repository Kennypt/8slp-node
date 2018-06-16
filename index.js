const client = require('./client');
const Session = require('./session');

const MIN_TEMPERATURE_VALUE = 10;
const MIN_TEMPERATURE_IN_BED_VALUE = 25;
const HEAT_LEVEL_OFFSET = 8;

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
        return await userWokeUp(this, 'left');
    }

    async rightSideWokeUp() {
        return await userWokeUp(this, 'right');
    }

    async leftInBed() {
        return await inBed(this, 'left');
    }

    async rightInBed() {
        return await inBed(this, 'right');
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

async function inBed(self, side) {
    const refreshSuccess = await refreshBedSidesData(self);
    if (!refreshSuccess) {
        return false;
    }

    const { heatingLevel, schedule, nowHeating, targetHeatingLevel } = self[`${side}Side`];

    const heatDelta = nowHeating ? (heatingLevel - targetHeatingLevel) : (heatingLevel - MIN_TEMPERATURE_VALUE);

    return heatDelta >= HEAT_LEVEL_OFFSET && currentHeatLevel >= MIN_TEMPERATURE_IN_BED_VALUE;
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

async function userWokeUp(self, side) {
    const { session, timezone } = self;
    const userId = self[`${side}Side`].userId;

    const from = getDate(timezone, -1).format('YYYY-MM-DD');
    const to = getDate(timezone).format('YYYY-MM-DD');

    const res = await client.getTrendsByUserId(session, userId, timezone, from, to);

    if (res && res.days && res.days.length) {
        const sleepEnd = res.days[0].sleepEnd;
        if (sleepEnd && (new Date(sleepEnd).getTime() - getDate(timezone).getTime() > 0)) {
            return true;
        }
    }

    await refreshBedSidesData(self);
    return self[`${side}Side`].heatingLevel === MIN_TEMPERATURE_IN_BED_VALUE;
}

function getDate(timezone, daysOffset = 0) {
    if (daysOffset === 0) {
        return new Date();
    }
    return new Date((new Date()).setDate(myDate.getDate() + daysOffset));
}

module.exports = EightClient;