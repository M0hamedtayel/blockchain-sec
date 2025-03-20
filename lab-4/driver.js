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

let agency = new SpyAgency();

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

//Mohamed Gaber Tayel   220100416
let blindDocs = [];
let blindingFactors = [];

documents.forEach((doc) => {
  let { blinded, r } = blind(doc, agency.n, agency.e);
  blindDocs.push(blinded);
  blindingFactors.push(r);
});


agency.signDocument(blindDocs, (selected, verifyAndSign) => {
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


  let unblindedSig = unblind(blindingFactors[selected], signedBlindedSig, agency.n);
  
  console.log(`Selected document: ${documents[selected]}`);
  console.log(`Unblinded signature: ${unblindedSig}`);
});
