window.addEventListener('load', pageLoad, false);

//Defining here to make available to everyone
var model;
var controller;

function pageLoad()
{
    //Initialize stuff
    controller = new Controller();
    model = new Model();
    model.finishLoad(startLoadGame);

    if(navigator.appName == 'Microsoft Internet Explorer') alert('You might need to install quicktime to properly view some media.\n(http://www.apple.com/quicktime/download)');
}

function startLoadGame()
{
    document.getElementById('messageContent').innerHTML = "Sifting";
    document.getElementById('message').style.display = 'block';
    callService("notes.getNotesWithAttributes", finishLoadGame, '', JSON.stringify({ gameId:model.gameId, searchTerms:[], noteCount:50, searchType:0, playerId:model.playerId, tagIds:[], lastLocation:0, date:0}));
}


function finishLoadGame(responseText)
{
    model.gameJSONText = responseText;
    responseData=JSON.parse(responseText);
    if(responseData.returnCode == 1) //Error
    {
        document.getElementById('messageContent').innerHTML = responseData.data;
        return;
    }
    model.populateFromData(responseData.data);


    controller.populateAllFromModel();

    //  Set actual page visible
    document.getElementById('messageContent').innerHTML = "";
    document.getElementById('message').style.display = 'none';

    google.maps.event.trigger(model.views.gmap, 'resize'); // To fix google maps incorrect sizing bug

}

function startSift(siftType){
	model.views.mainViewLeft.innerHTML = ''; //clear out old notes
    document.getElementById('messageContent').innerHTML = "Sifting...";
    document.getElementById('message').style.display = 'block'; //this is set to hidden after page loads first time

	//we remember this in model so that on tag or searchs we can retrieve the last used sift
	var searchTypeCode = model.getSiftTypeCode(siftType);

	//check to see if any search terms have been set, if so, build an array by word
	var searchTerms = $('.sifter-filter-search-input').filter(":visible").val().split(" ");

	//see which tags have been set and put their id #s in the selectedTags array
	var selectedTags = [];
	for(var i = 1; i <=5; i++){
		tagItem = document.getElementById("tag"+i);
		if(tagItem.checked ) {
		
			//each tag has an ID number, which must be sent to the JSON for the query to work right
			var tagIdNum;
			switch(tagItem.value.toLowerCase().trim()){
				case "innovation": tagIdNum = 117; break;
				case "must do": tagIdNum = 118; break;
				case "madison culture": tagIdNum = 119; break;
				case "stories of the past": tagIdNum = 120; break;
				case "100 years from now": tagIdNum = 121; break;
	
			}
			selectedTags[selectedTags.length] = tagIdNum;
		}
	}

	switch(siftType){
		case "top":
			siftString =  JSON.stringify({ gameId:model.gameId, searchTerms:[], noteCount:50, searchType:searchTypeCode, playerId:0, tagIds:selectedTags, lastLocation:0, date:0});
			break;
		case "recent":
			//don't use the date paramenter, bc then it'll only find the notes created since that date. We want it to just sort the notes by date & give 50 mores recent
		 	siftString =  JSON.stringify({ gameId:model.gameId, searchTerms:[], noteCount:50, searchType:searchTypeCode, playerId:0, tagIds:selectedTags, lastLocation:0, date:""});
			break;
		case "popular":
		 	siftString =  JSON.stringify({ gameId:model.gameId, searchTerms:[], noteCount:50, searchType:searchTypeCode, playerId:0, tagIds:selectedTags, lastLocation:0, date:0});
			break;
		case "mine":
		 	siftString =  JSON.stringify({ gameId:model.gameId, searchTerms:[], noteCount:50, searchType:searchTypeCode, playerId:model.playerId, tagIds:selectedTags, lastLocation:0, date:0});
			break;
		case "tags":
			
		 	siftString =  JSON.stringify({ gameId:model.gameId, searchTerms:[], noteCount:50, searchType:searchTypeCode, playerId:0, tagIds:selectedTags, lastLocation:0, date:0});

			break;
		case "search":
		 	siftString =  JSON.stringify({ gameId:model.gameId, searchTerms:[], noteCount:50, searchType:searchTypeCode, playerId:0, tagIds:selectedTags, lastLocation:0, date:0});

			break;

		default: siftString = "kSearchTop"; console.log("Error in sift type: " + siftType) ;
	}
    callService("notes.getNotesWithAttributes", finishLoadGame, '', siftString);
}
