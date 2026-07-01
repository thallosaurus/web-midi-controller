import type { OscMessagePayload } from "../client/protocol.ts";
import { OscDriver } from "../osc.ts";

const driver = new OscDriver();
driver.addEventListener((msg: OscMessagePayload) => {
    console.log("callback", msg);
})

driver.send({
    type: "oscmsg",
    address: "/4",
    args: [0.5, 0.5]
})

driver.send({
    type: "oscmsg",
    address: "/test",
    args: [0.5, 0.5]
})

setTimeout(() => {
    driver.stop();
}, 10000);