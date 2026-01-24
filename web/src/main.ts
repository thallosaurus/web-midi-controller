import './style.css'
import { CCSliderEvent, emitter, setup_slider } from "./slider";

//document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<h1>FUCK MY LIFE</h1>`


//setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
const sliders = document.querySelector<HTMLDivElement>("#sliders")!

emitter.addEventListener("ccupdate", (update: CCSliderEvent) => {
  console.log(update);
});

for (let i = 0; i < 5; i++) {
  setup_slider(sliders, {
    channel: 1,
    cc: i,
    mode: "snapback"
  })
}