var APP_NAME = 'salesDataClaimer';
var DB_NAME = 'salesDataClaimer';
var DB_TITLE = 'SalesDataClaimer Db';
var DB_TYPE = 'json';
var JSON_DB = '/jsondb';
var TYPE_RECORD = 'record';
var DB_MAPPINGS = {
    record: recordMapping
};
var RECORD_STATUS = {
    NEW: 0,
    REQUESTING: 1,
    APPROVED: 2,
    REJECTED: -1
};


