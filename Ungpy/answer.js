import {collection,
    doc,
    setDoc,
    addDoc,
    getDoc,
    updateDoc } 
    from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import {    pc,
collection_calls,
createSDP,
listenLocalCandidate,listenRemoteCandidate}
from "./webRTC.js"

const input_answer = document.querySelector('#input_answer');

let doc_call, col_offerCandidates, col_answerCandidates;



export async function answer(){
    const callID = input_answer.value;

    doc_call = doc(collection_calls, callID)
    col_answerCandidates = collection(doc_call, 'answerCandidates')
    col_offerCandidates = collection(doc_call, 'offerCandidates')

    listenLocalCandidate(col_answerCandidates)

    await getOffer(doc_call)

    const answerSDP = await createAnswer()

    sendAnswer(answerSDP)

    listenRemoteCandidate(col_offerCandidates)
}



async function getOffer(doc_call){
    
    const offerDescription = (await getDoc(doc_call)).data().offer;

    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

}

async function createAnswer(){

    const answerDescription = await pc.createAnswer()

    const answerSDP = await createSDP(answerDescription)

    return answerSDP
}

async function sendAnswer(answer){

    await updateDoc(doc_call, {answer})

}