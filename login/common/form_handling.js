/* @flow */

// Map of recorded form urls.
var formRecorder = {};

function clearRecordedForms() {
  formRecorder = {};
}


// TODO - can we get away without exporting a global formRecorder?
module.exports = { clearRecordedForms, formRecorder };
