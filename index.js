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

    async presenceEnd() {
        const left = await this.leftPresenceEnd();
        const right = await this.rightPresenceEnd();

        return left && right;
    }

    async presenceStart() {
        const left = await this.leftPresenceStart();
        const right = await this.rightPresenceStart();

        return left && right;
    }

    async leftPresenceEnd() {
        return await getPresenceEnd(this, 'left');
    }

    async rightPresenceEnd() {
        return await getPresenceEnd(this, 'right');
    }

    async leftPresenceStart() {
        return await getPresenceStart(this, 'left');
    }

    async rightPresenceStart() {
        return await getPresenceStart(this, 'right');
    }

    async sleepEnd() {
        const left = await this.leftSleepEnd();
        const right = await this.rightSleepEnd();

        return left && right;
    }

    async sleepStart() {
        // TODO
        return false;
    }

    async leftSleepStart() {
        // TODO
        return false;
    }

    async rightSleepStart() {
        // TODO
        return false;
    }

    async leftSleepEnd() {
        return await getSleepEnd(this, 'left');
    }

    async rightSleepEnd() {
        return await getSleepEnd(this, 'right');
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

async function getPresenceStart(self, side) {
    /* 
    await refreshBedSidesData(self);
    return self[`${side}Side`].heatingLevel === MIN_TEMPERATURE_IN_BED_VALUE; 
    */

    const refreshSuccess = await refreshBedSidesData(self);
    if (!refreshSuccess) {
        return false;
    }

    const { heatingLevel, schedule, nowHeating, targetHeatingLevel } = self[`${side}Side`];

    const heatDelta = nowHeating ? (heatingLevel - targetHeatingLevel) : (heatingLevel - MIN_TEMPERATURE_VALUE);

    return heatDelta >= HEAT_LEVEL_OFFSET && currentHeatLevel >= MIN_TEMPERATURE_IN_BED_VALUE;
}

async function getPresenceEnd(self, side) {
    const trends = await getLastDayTrends(self);

    if (!trends) {
        return false;
    }

    const { presenceEnd } = trends;
    return (presenceEnd && (new Date(presenceEnd).getTime() - getDate(timezone).getTime() > 0));
}

async function getSleepEnd(self, side) {
    const trends = await getLastDayTrends(self);

    if (!trends) {
        return false;
    }

    const { sleepEnd } = trends;
    return (sleepEnd && (new Date(sleepEnd).getTime() - getDate(timezone).getTime() > 0));
}

async function getLastDayTrends(self) {
    const { session, timezone } = self;
    const userId = self[`${side}Side`].userId;

    const from = getDate(timezone, -1).format('YYYY-MM-DD');
    const to = getDate(timezone).format('YYYY-MM-DD');

    const res = await client.getTrendsByUserId(session, userId, timezone, from, to);

    return res && res.days && res.days.length && res.days[0];
}

function getDate(timezone, daysOffset = 0) {
    if (daysOffset === 0) {
        return new Date();
    }
    return new Date((new Date()).setDate(myDate.getDate() + daysOffset));
}

module.exports = EightClient;