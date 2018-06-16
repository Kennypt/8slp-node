const client = require('./client');
const Session = require('./session');

const MIN_TEMPERATURE_VALUE = 10;
const MIN_TEMPERATURE_IN_BED_VALUE = 25;
const HEAT_LEVEL_OFFSET = 8;

class EightClient {
    constructor(session, deviceId, rightSide, leftSide, online, timezone) {
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
            timezone = resUserMe.user.timezone;
            
            const self = { session, deviceId };
            await refreshBedSidesData(self);
            rightSide = self.rightSide;
            leftSide = self.leftSide;
            online = self.online;
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
        return await hasPresenceEnd(this, 'left');
    }

    async rightPresenceEnd() {
        return await hasPresenceEnd(this, 'right');
    }

    async leftPresenceStart() {
        return await isInBed(this, 'left');
    }

    async rightPresenceStart() {
        return await isInBed(this, 'right');
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
        return await hasSleepEnd(this, 'left');
    }

    async rightSleepEnd() {
        return await hasSleepEnd(this, 'right');
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
    const resUser = await client.getDeviceById(self.session, self.deviceId);
    if (!resUser || !resUser.result) {
        return false;
    }

    self.leftSide = buildSideData('left', resUser.result);
    self.rightSide = buildSideData('right', resUser.result);
    self.online = resUser.result.online;

    return true;
}

async function isInBed(self, side) {
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

async function hasPresenceEnd(self, side) {
    const trends = await getLastDayTrends(self, side);

    if (!trends) {
        const inBed = await isInBed(self, side);
        return !inBed;
    }

    // TODO: Should look at incomplete?
    const { presenceEnd } = trends;
    return (presenceEnd && (new Date(presenceEnd).getTime() - getDate(timezone).getTime() > 0));
}

async function hasSleepEnd(self, side) {
    const trends = await getLastDayTrends(self, side);

    if (!trends) {
        return false;
    }

    const { sleepEnd } = trends;
    return (sleepEnd && (new Date(sleepEnd).getTime() - getDate(timezone).getTime() > 0));
}

async function getLastDayTrends(self, side) {
    const { session, timezone } = self;
    const userId = self[`${side}Side`].userId;

    const from = getFormattedDate(timezone, -1);
    const to = getFormattedDate(timezone);

    const res = await client.getTrendsByUserId(session, userId, timezone, from, to);

    return res && res.days && res.days.length && res.days[0];
}

function getFormattedDate(timezone, daysOffset = 0) {
    const now = new Date();

    if (daysOffset === 0) {
        const year = now.getYear() + 1900;
        const month = now.getMonth() + 1;
        const day = now.getDate();
        return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
    }

    const date = new Date(now.setDate(now.getDate() + daysOffset));
    const year = date.getYear() + 1900;
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
}

module.exports = EightClient;