console.log("js loaded!");

//reference to database
var db = firebase.firestore();

//add click listener to add to queue button
addButt = document.getElementById("addToQueue");
console.log(addButt);
addButt.addEventListener(
  "click",
  function() {
    addToQueue();
  },
  false
);

var queue;

//listen to changes in the entire queque collection
db.collection("queue").onSnapshot(function(querySnapshot) {
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
    for (let student of queue) {
      view += `
                <h3>${student.name}</h3>
                ${
                  student.description !== undefined
                    ? `
                    <p>${student.description}</p>`
                    : ``
                }
            `;
    }
  }

  //if we have a queue to show then show it!
  if (view !== "") {
    queueContainer.innerHTML = view;
  }
  //if we don't then take a break, smoke a j, chill out
  else {
    queueContainer.innerHTML = `<h2>Nobody in queue!</h2>`;
  }
};

//add a student the to queue
var addToQueue = e => {
  //get values from inputs
  let name = document.getElementById("name").value;
  let desc = document.getElementById("desc").value;

  if (name === "") {
    alert('You gotta enter a name a least...')
  } else {
    console.log("name is not empty");

    //Add a new student with a generated id.
    db.collection("queue")
      .add({
        name: name,
        country: desc
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
