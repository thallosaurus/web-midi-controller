import { MATRIX_OVERLAY, MIDI_TEST_OVERLAY, ROTARIES_TEST, TestOscOverlay } from "../src/Overlays"

const DEBUG_OVERLAYS = [TestOscOverlay, ROTARIES_TEST, MATRIX_OVERLAY, MIDI_TEST_OVERLAY];

export default [{
    url: "/overlays",
    method: "get",
    response: () => {
        return DEBUG_OVERLAYS
    }
}]