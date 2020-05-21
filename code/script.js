const video = document.getElementById('video')
var a=0
var c =''

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  //faceapi.nets.faceExpressionNet.loadFromUri('./models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
]).then(startVideo)

 function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )}
  

video.addEventListener('play',async () => {
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      if(result.toString().includes('Ali')){
        a=1
      }
      else{
        a=0
      }
      if (a===1){
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString()+' Quel BG!!! ' })
        drawBox.draw(canvas)
      }
      if (a===0){
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString()+' Tu es vraiement moche! ' })
        drawBox.draw(canvas)
      }
    })
    //faceapi.draw.drawDetections(canvas, resizedDetections, { label: 'Face' })
    //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})

function loadLabeledImages(){
  const labels = ['Ali','Moha','Alaa']
  return Promise.all(
    labels.map(async label =>{
      const descriptions = []
      for (let i = 1; i<=2; i++){
        const img = await faceapi.fetchImage(`./labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
      
    })
  )
}
