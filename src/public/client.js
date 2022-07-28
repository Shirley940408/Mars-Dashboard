let store = {
  user: { name: "Student" },
  apod: "",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
};

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
  render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = (state) => {
  let { rovers, apod } = state;

  return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
            </section>
            <div>${onClickButton(rovers)}</div>
            <div id="userClicked"></div>
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
  if (name) {
    return `
            <h1>Welcome, ${name}!</h1>
        `;
  }

  return `
        <h1>Hello!</h1>
    `;
};

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = new Date(apod.date);
  if (!apod || apod.date === today.getDate()) {
    getImageOfTheDay(store, updateStore);
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === "video") {
    return `
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `;
  } else {
    return `
            <img src="${apod.image && apod.image.url}" height="350px" width="100%" />
            <p>${apod.image && apod.image.explanation}</p>
        `;
  }
};

const UItemplate = (roverDecode, listLoop) => {
  const {img_src} = roverDecode;
    if (roverDecode != null) {
    const element = document.getElementById("userClicked");
    element.innerHTML = '';
    listLoop(element, roverDecode, img_src);
  }
}  
const listLoop = (element, roverDecode, img_src) => {
     Object.keys(roverDecode).filter((key)=> key!='id').forEach((key) => {
      if(key == "img_src"){
        const img = new Image();
        img.src = img_src;
        const x = window.matchMedia("(max-width: 700px)");
        x.matches? img.style.width = "100%" : img.style.width = "350px";
        element.appendChild(img);
      }else{
        const para = document.createElement("p");
        const node = document.createTextNode(`${key}: ${roverDecode[key]}`)
        para.appendChild(node);
        element.appendChild(para);
      }
    })
}

const onClickButton = (rovers) => {
  getPhotosFromRovers(store, updateStore);
  return `${rovers.reduce(
    (acc, rover) =>
      acc +
      `<button onClick="update('${encodeURIComponent(JSON.stringify(rover))}')">${
        rover.name
      }</button>`,
    ""
  )}`;
};



const update = (rover) => {
  const roverDecode = JSON.parse(decodeURIComponent(rover));
  UItemplate(roverDecode, listLoop);
};
// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state, callback) => {
  let { apod } = state;

  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => {
      callback(store, { apod });
    });
};

const getPhotosFromRovers = (state, callback) => {
  fetch(`http://localhost:3000/rover`)
    .then((res) => res.json())
    .then((rovers) => {
      let prevStateChanged = false;
      rovers.forEach((rover, i) => {
        if (rover.id != state.rovers[i].id) {
          prevStateChanged = true;
        }
      });
      prevStateChanged && callback(store, { rovers });
    });
};
