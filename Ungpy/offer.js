import {collection,
    doc,
    setDoc,
    onSnapshot, } 
    from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import {    pc,
collection_calls,
createSDP,
listenLocalCandidate,listenRemoteCandidate}
from "./webRTC.js"

const input_offer = document.querySelector('#input_offer');

let doc_call, col_offerCandidates, col_answerCandidates;

export async function offer(){
    doc_call = doc(collection_calls)
    col_offerCandidates = collection(doc_call, 'offerCandidates')
    col_answerCandidates = collection(doc_call, 'answerCandidate')

    input_offer.value = doc_call.id;
    
    listenLocalCandidate(col_offerCandidates)

    const offerSDP = await createOffer()

    sendOffer(offerSDP)

    waitAnswer()

    listenRemoteCandidate(col_answerCandidates)
}

async function createOffer(){
    const offerDescription = await pc.createOffer()
    const offerSDP = await createSDP(offerDescription)
    return offerSDP
}

async function sendOffer(offer){
    await setDoc(doc_call, {offer})
}

async function waitAnswer(){
    onSnapshot(doc_call, snapshot => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data?.answer){
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.setRemoteDescription(answerDescription);
        }
    })
}
