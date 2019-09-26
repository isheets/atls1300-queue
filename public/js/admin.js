console.log("js loaded!");

//reference to database
var db = firebase.firestore();

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
            
        <button class="remove-from-queue" id="remove${i}">remove me</button>
        </article>`;
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

