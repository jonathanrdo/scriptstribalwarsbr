javascript:
if (window.location.href.indexOf('map') < 0) {
    window.location.assign(game_data.link_base_pure + "map");
}
var limit = 0;
var villageIDs = [];
var creator = [];
var data = [];
var langShinko = {
    "en_DK": {
        "player": "Player:",
        "coord": "Coordinates:"
    },
    "en_GB": {
        "player": "Player:",
        "coord": "Coordinates:"
    },
    "en_US": {
        "player": "Player:",
        "coord": "Coordinates:"
    },
    "it_IT": {
        "player": "Giocatore:",
        "coord": "Coordinate:"
    },
    "pt_BR": {
        "player": "Jogador:",
        "coord": "Coordenadas:"
    },
    "pt_PT": {
        "player": "Jogador:",
        "coord": "Coordenadas:"
    },
    "el_GR": {
        "player": "Î Î±Î¯ÎºÏ„Î·Ï‚:",
        "coord": "Î£Ï…Î½Ï„ÎµÏ„Î±Î³Î¼Î­Î½ÎµÏ‚:"
    },
    "sv_SE": {
        "player": "Spelare:",
        "coord": "Koordinater:"
    }
}

Dialog.show("content", `
<h1>Select which notes you'd like to search for</h1>
<center>
<input type="button" class="btn btn-confirm-yes" value="Own" onClick="setOwn()" />
<input type="button" class="btn btn-confirm-yes" value="Shared" onClick="setShared()" />
<input type="button" class="btn btn-confirm-yes" value="All" onClick="setAll()" />
</center>`);


function setOwn() {
    limit = 1;
    Dialog.close();
    findNotes();
}

function setShared() {
    limit = 2;
    Dialog.close();
    findNotes();
}
function setAll() {
    limit = 0;
    Dialog.close();
    findNotes();
}

function findNotes() {
    //check all icons on minimap
    for (key in TWMap.villageIcons) {
        //check for a note property to find the village notes
        for (property in TWMap.villageIcons[key]) {
            if (property == "note") {
                console.log(key);
                if (TWMap.villageIcons[key].note.img.includes("village_notes") == true) {
                    id = key;
                    creatorType = parseInt(TWMap.villageIcons[key].note.img.match(/village_notes_(\d)/)[1]);
                    if (limit == 0) {
                        villageIDs.push(id);
                    }
                    else {
                        if (creatorType == limit) {
                            villageIDs.push(id);
                        }
                    }

                    /*if (creatorType == 1) {
                        //own village note
                        creator.push("own");
                    } else {
                        //someone elses note
                        creator.push("someone else");
                    }*/

                }
            }
        }
    }



    //loading bar
    let width=$("#contentContainer")[0].clientWidth;
    $("#contentContainer").eq(0).prepend(`
<div id="progressbar" class="progress-bar progress-bar-alive">
<span id="count" class="label">0/${villageIDs.length}</span>
<div id="progress"><span id="count2" class="label" style="width: ${width}px;">0/${villageIDs.length}</span></div>
</div>`);


    //function to get multiple urls
    $.getAll = function (
        urls, // array of URLs
        onLoad, // called when any URL is loaded, params (index, data)
        onDone, // called when all URLs successfully loaded, no params
        onError // called when a URL load fails or if onLoad throws an exception, params (error)
    ) {
        var numDone = 0;
        var lastRequestTime = 0;
        var minWaitTime = 200; // ms between requests
        loadNext();
        function loadNext() {
            if (numDone == urls.length) {
                onDone();
                return;
            }

            let now = Date.now();
            let timeElapsed = now - lastRequestTime;
            if (timeElapsed < minWaitTime) {
                let timeRemaining = minWaitTime - timeElapsed;
                setTimeout(loadNext, timeRemaining);
                return;
            }
            console.log('Getting ', urls[numDone]);
            $("#progress").css("width", `${(numDone + 1) / urls.length * 100}%`);
            $("#count").text(`${(numDone + 1)} / ${urls.length}`);
            $("#count2").text(`${(numDone + 1)} / ${urls.length}`);
            lastRequestTime = now;
            $.get(urls[numDone])
                .done((data) => {
                    try {
                        onLoad(numDone, data);
                        ++numDone;
                        loadNext();
                    } catch (e) {
                        onError(e);
                    }
                })
                .fail((xhr) => {
                    onError(xhr);
                })
        }
    };


    infoURLs = [];
    for (var i = 0; i < villageIDs.length; i++) {
        infoURLs.push(`/game.php?&screen=info_village&id=${villageIDs[i]}`);
    }
    villagesHTML = "";
    var tempRow;
    $.getAll(infoURLs,
        (i, blabla) => {
            thisVillaNotes = $(blabla).find(".village-notes-container")[0].innerHTML;
            thisVillaName = $(blabla).find(".icon.header.village")[1].parentElement.innerText;
            thisVillaCoordinate = $(blabla).find("td:contains('" + langShinko[game_data.locale]["coord"] + "')").next()[2].innerText;
            if ($(blabla).find("td:contains('" + langShinko[game_data.locale]["player"] + "')").length != 0) {
                thisVillaPlayer = $(blabla).find("td:contains('" + langShinko[game_data.locale]["player"] + "')").next()[2].innerText;
                thisVillaPlayerID = $(blabla).find("td:contains('" + langShinko[game_data.locale]["player"] + "')").next()[2].children[0].href.match(/id=(\d*)/)[1];
                thisVillaPlayerID = `<a href="/game.php?&screen=info_player&id=${thisVillaPlayerID}">${thisVillaPlayer}</a>`
            }
            else {
                thisVillaPlayerID = "Barbarians :D";
            }

            if (i % 2 == 0) {
                tempRow = "class='row_b'";
            }
            else {
                tempRow = "class='row_a'";
            }
            urlParams = new URLSearchParams(infoURLs[i]);
            myParam = urlParams.get('id');
            villagesHTML += `<tr ${tempRow}><td><a href ="${infoURLs[i]}">${thisVillaName}</a></td><td>${thisVillaPlayerID}</td><td style="text-align:center"><a href ="${infoURLs[i]}" target="_blank">${thisVillaCoordinate}</a></td><td id="${myParam}">${thisVillaNotes}</td></tr>`
        },
        () => {
            //on done
            htmlCode = `
            <div id="villageNotes" class="vis" border=0>
                <table id="tableNotes" width="100%" border=1>
                    <tbody id="appendHere">
                        <tr>
                            <th colspan=6 width=â€œ550â€ style="text-align:center" >Village notes</th>
                        </tr>
                        <tr>
                            <th width="15%" style="text-align:center">Village name</th>
                            <th width="15%" style="text-align:center">Village owner</th>
                            <th width="5%" style="text-align:center">Coord</th>
                            <th width="65%">
                                <font size="1">Script created by Sophie "Shinko to Kuma"</font>
                            </th>
                        </tr>
                        ${villagesHTML}
                    </tbody>
                </table>
            </div>`;

            $("#contentContainer").eq(0).prepend(htmlCode);
            for (var k = 0; k < $(".float_right.tooltip.village-note-delete").length; k++) {

                $(".float_right.tooltip.village-note-delete")[k].onclick = function () {
                    idToDelete = this.parentElement.parentElement.parentElement.parentElement.id;
                    deleteNote(idToDelete);
                    this.parentElement.parentElement.parentElement.parentElement.innerHTML = "";
                };
            }
        },
        (error) => {
            console.error(error);
        });

    function deleteNote(villageID) {
        var e = { "village_id": villageID, "note": "" };
        TribalWars.post("api", {
            ajaxaction: "village_note_edit",
        }, e, function () {
            UI.SuccessMessage("Succesfully deleted message");
        },
            !1
        );
    }
}
