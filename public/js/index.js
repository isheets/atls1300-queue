console.log("js loaded!");

//reference to database
var db = firebase.firestore();

//generate a unique id
var uniqueId = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

//cache the user between sessions or generate a new user id - takes the place of actual authentication
var studentID = localStorage.getItem("studentID");
if (studentID === null) {
  studentID = uniqueId();
  localStorage.setItem("studentID", studentID);
}

//add click listener to add to queue button
addButt = document.getElementById("addToQueue");
addButt.addEventListener(
  "click",
  function() {
    addToQueue();
  },
  false
);

var queue;

//listen to changes in the entire queque collection and retrieve newest last
db.collection("queue")
  .orderBy("insertedAt")
  .onSnapshot(function(querySnapshot) {
    queue = [];
    querySnapshot.forEach(function(doc) {
      queue.push(doc.data());
    });
    console.log(queue);
    updateQueue();
  });

var updateQueue = () => {
  //lazy load queue element
  const queueContainer = null || document.getElementById("queue");

  //will hold jsx
  let view = "";

  //loop over data and generate JSX if we have data
  if (queue.length > 0) {
    view += `<h2 class="section-head">CURRENT HELP QUEUE</h2>`;
    let num = 1;
    for (let i = 0; i < queue.length; i++) {
      //if the entry was created by the current user, show option to delete
      let student = queue[i];
      view += `<article class="student">
                <h3 class="student-name">${num}. ${student.name}</h3>
                ${
                  student.description !== undefined
                    ? `
                    <p class="student-desc">${student.description}</p>`
                    : ``
                }
            `;

      if (student.studentID === studentID) {
        view += `<button class="remove-from-queue" id="remove${i}">remove me</button>`;
      }
      view += "</article>";
      num++;
    }
  }

  //if we have a queue to show then show it!
  if (view !== "") {
    queueContainer.innerHTML = view;
    let removeButtons = document.querySelectorAll(".remove-from-queue");
    console.log(removeButtons);
    for (let button of removeButtons) {
      button.addEventListener("click", deleteFromQueue, false);
    }
  }
  //if we don't then take a break, smoke a j, chill out
  else {
    queueContainer.innerHTML = `<h2>HELP QUEUE IS EMPTY</h2>`;
  }
};

var deleteFromQueue = e => {
  //get id string
  let id = e.target.id;
  //extract id num
  let queuePosition = id.match(/\d+/)[0];
  //get the record
  let record = queue[queuePosition];
  console.log(record);
  //remove record from collection using where query
  db.collection("queue")
    .where("name", "==", record.name)
    .where("insertedAt", "==", record.insertedAt)
    .get()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        doc.ref.delete();
      });
    });
};
//add a student the to queue
var addToQueue = e => {
  //get values from inputs
  let name = document.getElementById("name").value;
  let desc = document.getElementById("desc").value;

  //clear fields out
  document.getElementById("name").value = '';
  document.getElementById("desc").value = '';

  if (name === "") {
    alert("You gotta enter a name a least...");
  } else {
    console.log("name is not empty");

    //Add a new student with a generated id.
    db.collection("queue")
      .add({
        name: name,
        description: desc,
        studentID: studentID,
        insertedAt: new Date()
      })
      .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
  }
};

//function to update
