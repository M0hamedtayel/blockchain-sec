"use strict";

let blindSignatures = require("blind-signatures");
let SpyAgency = require("./spyAgency.js").SpyAgency;

function makeDocument(coverName) {
  return `The bearer of this signed document, ${coverName}, has full diplomatic immunity.`;
}

function blind(msg, n, e) {
  return blindSignatures.blind({
    message: msg,
    N: n,
    E: e,
  });
}

function unblind(blindingFactor, sig, n) {
  return blindSignatures.unblind({
    signed: sig,
    N: n,
    r: blindingFactor,
  });
}

// Create the spy agency instance
let agency = new SpyAgency();

// 1️⃣ Generate 10 documents with different cover identities
let coverNames = [
  "Agent Alpha",
  "Agent Bravo",
  "Agent Charlie",
  "Agent Delta",
  "Agent Echo",
  "Agent Foxtrot",
  "Agent Golf",
  "Agent Hotel",
  "Agent India",
  "Agent Juliet",
];

let documents = coverNames.map(makeDocument);
console.log(" Original documents:", documents); // ✅ Print original documents for verification

// 2️⃣ Perform blinding
let blindDocs = [];
let blindingFactors = [];

documents.forEach((doc, index) => {
  let { blinded, r } = blind(doc, agency.n, agency.e);
  blindDocs.push(blinded);
  blindingFactors.push(r);
  console.log(` Blinded document ${index}:`, blinded);
});

// 3️⃣ Request agency to sign the documents
agency.signDocument(blindDocs, (selected, verifyAndSign) => {
  console.log(` Selected document for signing: ${selected}`);

  let docsToSign = [];
  let factorsToSign = [];

  for (let i = 0; i < blindDocs.length; i++) {
    if (i === selected) {
      docsToSign.push(undefined);
      factorsToSign.push(undefined);
    } else {
      docsToSign.push(documents[i]);
      factorsToSign.push(blindingFactors[i]);
    }
  }

  let signedBlindedSig = verifyAndSign(factorsToSign, docsToSign);
  console.log(` Blinded signature received:`, signedBlindedSig);

  // 4️⃣ Unblind the signature and verify it
  let unblindedSig = unblind(blindingFactors[selected], signedBlindedSig, agency.n);
  console.log(` Unblinded signature:`, unblindedSig);
});
