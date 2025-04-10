import * as Carousel from "./Carousel.mjs";
//import axios from "axios"; // axios is imported in index.html

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY = "live_UiYOtzJxYjaOcMznmcDsCQWt40ZtbTnzJfK79kFocCstrGVSPTv8rIMbVsmsuNz3";
const USER_NAME = "test_user";

let breads = []; // Array to store information about the breeds
let favorites = []; // array to store img id of favorites
let requestStartTime = null;
let isFavoritePage = false;

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */

(function initializeInterceptors() { //inisilising interceptors BEFORE the initial iife
    //adiing interceptors 
    axios.interceptors.request.use(it => {
        requestStartTime = Date.now();
        console.log(`Request started at ${Date(requestStartTime)}`);
        progressBar.style.width = `0%`;
        document.body.style.cursor = `progress`; // part 7 
        return it;
    })
    axios.interceptors.response.use(it => {
        let requestEndTime = Date.now();
        console.log(`Response recieved at ${Date(requestEndTime)} and query time is ${requestEndTime - requestStartTime} ms`);
        document.body.style.cursor = `default`; // part 7 
        return it;
    })
})();

(async function initialLoadWithFetch() { //iife
    try {
        axios.defaults.baseURL = "https://api.thecatapi.com/v1/";
        let favResponse = axios.get(`favourites`,
            {
                headers: {
                    "x-api-key": API_KEY
                },
                params: {
                    attach_image: 1,
                    sub_id: USER_NAME
                }
            }
        );
        let response = axios({
            method: "GET",
            url: "breeds",
            onDownloadProgress: updateProgress
        });
        [favResponse, response] = await Promise.all([favResponse, response]); // promise.all to fetch cats and favorites at the same time in parallel
        favorites = favResponse.data; // storing favorites in the array
        if (response.status === 200) {
            breads = response.data;
        } else {
            throw new Error("Failed to fetch breeds");
        }
        breads.forEach(it => {
            let newOption = document.createElement("option");
            newOption.value = it.id;
            newOption.textContent = it.name;
            breedSelect.appendChild(newOption);
        });
        axiosBreed(breads[0]); // fetching first element and population carousel
    } catch (error) {
        console.error(`Error geting breads: ${error}`);
    }
})();

breedSelect.addEventListener(`change`, breedSelectEvent);
getFavouritesBtn.addEventListener(`click`, favoritesSelectEvent);

function populateCarousel(breadImgs, breedObj) {
    Carousel.clear();
    infoDump.innerHTML = ``;
    if (breadImgs.length === 0) {
        let newCarouselItem = Carousel.createCarouselItem(`image_coming_soon_cat.png`, `image coming soon`, `image coming soon`);
        const favBtn = newCarouselItem.querySelector(".favourite-button");
        favBtn.remove();
        Carousel.appendCarousel(newCarouselItem);
    } else {
        breadImgs.forEach(it => {
            let url = null;
            let id = null;
            if (it.url) {
                url = it.url;
                id = it.id;
            } else {
                url = it.image.url;
                id = it.image.id;
            }
            let newCarouselItem = Carousel.createCarouselItem(url, `Image of ${breedObj.name} cat`, id);
            if (favorites.find(it => it.image.id === id)) { //this is a favorite image
                let favBtn = newCarouselItem.querySelector(".favourite-button");
                favBtn.classList.add(`favourite-button-selected`);
            }
            Carousel.appendCarousel(newCarouselItem);
        });        
    }
    infoDump.innerHTML = `<h2>${breedObj.name}</h2><p>${breedObj.description}</p>`;
    Carousel.start();
}

async function axiosBreed(bread) {
    let breadImgs = await axios.get(`images/search`,
        {
            headers: {
                "x-api-key": API_KEY
            },
            params: {
                limit: 5,
                breed_id: bread.id
            },
            onDownloadProgress: updateProgress
        }
    );
    populateCarousel(breadImgs.data, bread);
}

async function axiosFavorites(userName) {
    //because favorites should be loaded at start
    // let breadImgs = await axios.get(`favourites`,
    //     {
    //         headers: {
    //             "x-api-key": API_KEY
    //         },
    //         params: {
    //             attach_image: 1,
    //             sub_id: userName
    //         },
    //         onDownloadProgress: updateProgress
    //     }
    // );
    populateCarousel(favorites, { name: `Favourites`, description: `Your favourite cats` });
}

function updateProgress(progressEvent) {
    progressBar.style.width = `${progressEvent.progress * 100}%`;
}



function breedSelectEvent(ev) {
    isFavoritePage = false;
    axiosBreed(breads.find(it => it.id === ev.target.value));
}

function favoritesSelectEvent(ev) {
    isFavoritePage = true;
    axiosFavorites(USER_NAME);
}



/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId, target) {
    //console.log(`Fav button clicked ${imgId}`);
    //checking if the image is already in favorites or not
    let fav = favorites.find(it => it.image.id === imgId);
    if (fav !== undefined) { //this image is already in favorites so delet
        try {
            await axios.delete(`favourites/${fav.id}`,
                // {
                //     "image_id": imgId,
                //     "sub_id": USER_NAME
                // },
                {
                    headers: {
                        "x-api-key": API_KEY
                    },

                }
            );
            favorites = favorites.filter(it => it.image.id !== imgId);
            target.classList.remove(`favourite-button-selected`);
            if (isFavoritePage) {
                axiosFavorites(USER_NAME); // repopulating the carousel
            }
        } catch (error) {
            console.error(`Error deleting favourite: ${error}`);
        }
    } else { //adding
        try {
            let favId = await axios.post(`favourites`,
                {
                    "image_id": imgId,
                    "sub_id": USER_NAME
                },
                {
                    headers: {
                        "x-api-key": API_KEY
                    },

                }
            );
            favId = favId.data.id; // this is the Unique id of the favorite image (store it so that we can delet it)
            favorites.push({ //just pushing new image to local favorites so that we should not get it again then displaing favorites
                "id": favId,
                "image_id": imgId,
                "sub_id": USER_NAME,
                "image": { //this is `image` object
                    id: imgId,
                    url: `https://cdn2.thecatapi.com/images/${imgId}.jpg`
                }
            });
            target.classList.add(`favourite-button-selected`);
        } catch (error) {
            console.error(`Error adding favourite: ${error}`);
        }
    }

}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */


//initialLoadWithFetch();