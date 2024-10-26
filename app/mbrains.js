/* headers: {
    'User-Agent': 'musicplayer-electron/1.0 +https://stuartambient.github.io/musicapp-intro/'
  } */

import { MusicBrainzApi } from "musicbrainz-api";

const config = {
  baseUrl: "https://musicbrainz.org",
  appName: "musicplayer-electron",
  appVersion: "1.0.0",
  appMail: "myxy9@proton.me",
};

const mbApi = new MusicBrainzApi(config);

const queryArtist = async () => {
  /*   try {
    const artists = await mbApi.search("artist", { query: "Gavin AND Friday" });
    console.log("artists: ", artists);
    const artistMbid = artists.artists[0].id;
    const artist = await mbApi.lookup("artist", artistMbid);
    console.log(artist);
  } catch (err) {
    console.error(err);
  } */
  const artist = await mbApi.search("artist", { query: "Virgin AND Prunes" });
  //console.log(artist);
  const topArtist = artist.artists.filter(artist => artist.score === 100);
  console.log(topArtist[0].id, topArtist[0].name, topArtist[0]["sort-name"]);
  console.log("---------------------");
  const result = await mbApi.search("release-group", {
    query: "Virgin Prunes",
  });
  result["release-groups"].forEach(rg => {
    console.log(rg.title, "--", rg["primary-type"], "--", rg["releases"]);
  });

  /*   console.log("artist: ", artist);
  const result = await mbApi.search("release-group", {
    query: "Virgin Prunes",
  });
  console.log("results: ", result);*/
};

queryArtist();
