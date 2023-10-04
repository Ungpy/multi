import { initializeApp } 
    from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {getFirestore,
    collection,
    addDoc,
    onSnapshot } 
    from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { offer} from "./offer.js"
import { answer } from "./answer.js";
const app = initializeApp(firebaseConfig);
const fireStore = getFirestore(app);
export const collection_calls = collection(fireStore,'calls');


const vdo_local = document.querySelector('#vdo_local');
const vdo_remote = document.querySelector('#vdo_remote');

const btn_webCam = document.querySelector('#btn_webCam');
const btn_offer = document.querySelector('#btn_offer');
const btn_answer = document.querySelector('#btn_answer');


const server = {
    iceServer: [
        {
            urls:   [
                        'stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302'
                        //stunserver ของ google คลิปนาทีที่ 18
                    ]
        }
    ],
    iceCandidatePoolSize: 10,
};

export const pc = new RTCPeerConnection(server);

let localStream = null;
let remoteStram = null;

btn_webCam.onclick = setStream;
btn_offer.onclick = offer;
btn_answer.onclick = answer;
//console.log(fireStore)

async function setStream(){
    localStream = await navigator.mediaDevices.getUserMedia({
        video:true,
        audio:false
    })

    remoteStram = new MediaStream();

    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
    })

    pc.ontrack = event => {
        event.streams[0].getTracks().forEach(track => {
            remoteStram.addTrack(track)
        })
    }

    vdo_local.srcObject = localStream;
    vdo_remote.srcObject = remoteStram;

    btn_offer.disabled = false;
    btn_answer.disabled = false;
    btn_webCam.disabled = true;
}

export async function createSDP(description){
    await pc.setLocalDescription(description);

    const sdp = {
        sdp: description.sdp,
        type: description.type
    }

    return sdp;
}

export function listenLocalCandidate(collection){
    pc.onicecandidate = event => {
        event.candidate && addDoc(collection, event.candidate.toJSON());
    }
}

export async function listenRemoteCandidate(collection){
    
    onSnapshot(collection, snapshot =>{

        snapshot.docChanges().forEach(change => {

            if (change.type === 'added') {
                const data = change.doc.data();
                const candidate = new RTCIceCandidate(data);
                pc.addIceCandidate(candidate);
            }
        })
    })
}