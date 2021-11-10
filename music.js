let audio, button;
let fft;

let spectrum;
let vid1, vid2, vid3;
let playing = false;
let completion;

let w,h

let strokeColor = `rgb(10,10,10)`
let strokeHue = 10

let nectar1IsClicked = false
let nectar2IsClicked = false
let nectar3IsClicked = false

let ant
let antPos = 0

function preload() {
  audio1 = loadSound('./prettyboy.mp3')
  audio2 = loadSound('./gimmelove.mp3')
  audio3 = loadSound('./modus.mp3')
  ant = loadImage('./ant.png')
}

function setup() {

  window.addEventListener('resize',()=>{
     setTimeout(()=>{
       window.location.reload(true);
     },300)
    // w = window.innerWidth;
    // h = window.innerHeight;
    // createCanvas(800, h).parent('canvasBox')
  })

  w = window.innerWidth;
  h = window.innerHeight;
  vid1 = createVideo(['./prettyboi.mp4']);
  vid2 = createVideo(['./gimmelove.mp4']);
  vid3 = createVideo(['./modus.mp4']);

  vid1.position(0, 0);
  vid1.class('video-filter1')
  vid1.id('video1')
  vid1.size(w, h);

  vid2.position(0, 0);
  vid2.class('video-filter2')
  vid2.id('video2')
  vid2.size(w, h);

  vid3.position(0, 0);
  vid3.class('video-filter3')
  vid3.id('video3')
  vid3.size(w, h);

  button1 = createButton('nectar').parent('canvasBox')
  createCanvas(w, h).parent('canvasBox')
  button1.id('b1')
  button1.mousePressed(function() {
    bitterCount ++
    nectar1IsClicked = !nectar1IsClicked
    let x = Math.random()*width
    let y = -Math.random()*2
    document.querySelector('#b1').style.transform = `translate(${x}px,${y}px)`
    changeText()
    if (audio1.isPlaying()) {
      audio1.stop();
    } else {
      audio1.play();
    }

    if (!playing) {
      vid1.play();
      playing = true;
    } else {
      vid1.stop();
      playing = false;
    }
  })


  button2 = createButton('nectar').parent('canvasBox')
  createCanvas(w, h).parent('canvasBox')
  button2.id('b2')
  button2.mousePressed(function() {
    bitterCount ++
    nectar2IsClicked = !nectar2IsClicked
    let x = Math.random()*width
    let y = -Math.random()*5
    document.querySelector('#b2').style.transform = `translate(${x}px,${y}px)`
    changeText()
    if (audio2.isPlaying()) {
      audio2.stop();
    } else {
      audio2.play();
    }

    if (!playing) {
      vid2.play();
      playing = true;
    } else {
      vid2.stop();
      playing = false;
    }
  })


  button3 = createButton('nectar').parent('canvasBox')
  createCanvas(w, h).parent('canvasBox')
  button3.id('b3')
  button3.mousePressed(function() {
    bitterCount ++
    nectar3IsClicked = !nectar3IsClicked
    let x = Math.random()*width
    let y = -Math.random()*20
    document.querySelector('#b3').style.transform = `translate(${x}px,${y}px)`
    changeText()
    if (audio3.isPlaying()) {
      audio3.stop();
    } else {
      audio3.play();
    }

    if (!playing) {
      vid3.play();
      playing = true;
    } else {
      vid3.stop();
      playing = false;
    }
  })

  fft = new p5.FFT();


}

let bitterCount = 0

function draw() {



  //strokeColor = `hsl(${strokeHue},${map(mouseX,0,w,0,100)}%,65%)`

  clear()

//BITTER on clicking the button
  for(let i=0;i<bitterCount;i++){
    let c1 = `hsl(${10},${10}%,${noise(i*100)*30+50}%)`
    fill(c1)
    noStroke()
    let offset = noise(i)*10
    circle(width-160-i*30-offset,25,30)
  }

//SWEET on clicking the button
  if(nectar1IsClicked){
    fill('rgb(228, 51, 13)')
    noStroke()
    circle(40, 710, 55)
    document.querySelector('#deco5').style.display = `none`
  }

  if(nectar2IsClicked){
    fill('rgb(183, 244, 12)')
    noStroke()
    circle(70, 710, 55)
document.querySelector('#deco5').style.display = `none`
  }

  if(nectar3IsClicked){
    fill('rgb(101, 24, 244)')
    noStroke()
    circle(100, 710, 55)
document.querySelector('#deco5').style.display = `none`
  }

  if (fft) spectrum = fft.analyze()

  noFill()


  antPos += 1
  if(antPos*5>w) {antPos = -5}
  image(ant,antPos*5,10)


  /*for (let ring = 1; ring < 10; ring++) {
    beginShape()
    for (let i = 1; i < 10 + 1; i++) {
      let radius = 200 + spectrum[i] / 10 - ring / 2
      let a = 2 * PI / 100 * i + frameCount / 100 + ring / 100
      let x = cos(a) * radius + 300
      let y = sin(a) * radius + 300

      curveVertex(x, y, 250)
    }
    endShape(CLOSE)
  }*/

  stroke('black')


  for (let ring = 1; ring < 50; ring++) {
    beginShape()
    for (let i = 1; i < 100 + 1; i++) {
      let radius = 80 + spectrum[i] / 4 - ring * 1.5
      let a = 2 * PI / 100 * i + frameCount / 50 + ring / 100 + map(mouseX,0,width,0,1)
      let x = cos(a) * radius * 2 + Math.sin(frameCount/100)*map(spectrum[i],0,255,0,40)
      let y = sin(a) * radius * 2 + h / 2

      curveVertex(x, y, 200)
    }
    endShape(CLOSE)
  }

}

let contents1 = ['Sometimes i think','Gimme gimme love','These people aint real','I cannot stop','I am a machine','I stay alive', 'I cannot control']
let contents2 = ['THE TREASURE IS IN THE BOOM','IM JUST NOT STRONG ENOUGH FOR U','NO MORE FEAR AND NO MORE LIES','IM A PRETTY BOI LIVIN ON THE WEST SIDE','THESE HILLS THEY BURN SO BRIGHT']
function changeText(){
  document.querySelector('#deco3').innerHTML = contents1[Math.floor(Math.random()*contents1.length)]
  document.querySelector('#deco4').innerHTML = contents2[Math.floor(Math.random()*contents2.length)]
}
