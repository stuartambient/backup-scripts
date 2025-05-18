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
/* const releases = []; */

/* const queryArtist = async () => {
  try {
    const artists = await mbApi.search("artist", { query: "David AND Bowie" });
    const artistMbid = artists.artists[0].id;
    const releaseGroups = await mbApi.browse(
      "release-group",
      {
        artist: artistMbid,
        offset: "0",
        limit: "10",
      },
      ["releases"]
    );
    console.log(
      releaseGroups["release-groups"].length,
      releaseGroups["release-groups"]
    );
    releaseGroups["release-groups"].forEach(group => {
      releases.push(group["id"]);
    });
  } catch (err) {
    console.error(err);
  }



  const iterateReleases = async () => {
    const a = releases.shift();
    console.log("a: ", a);
    const rel = await mbApi.lookup("release", a);
    console.log(rel);
  };

  iterateReleases(); */

const artist = await mbApi.search("artist", { query: "Virgin AND Prunes" });
const topArtist = artist.artists.filter(artist => artist.score === 100);
console.log(topArtist[0].id, topArtist[0].name, topArtist[0]["sort-name"]);
const rels = await mbApi.lookup("artist", topArtist[0].id, ["artist-rels"]);
console.log("rels: ", rels.relations[0].artist);
console.log("===========>");

let releases = [];

const result = await mbApi.search("release-group", {
  query: "David Bowie",
});

result["release-groups"].forEach(rg => {
  releases = [...releases, ...rg["releases"]];
});
const mappedReleases = releases.map(release => ({
  id: release.id,
  title: release.title,
  status: release.status,
}));

console.log(mappedReleases);

const release = await mbApi.lookup(
  "release",
  "e6ba5423-55c1-4960-ab89-4a61d972ab0b",
  ["recordings", "media"]
);

const tracks = release.media[0].tracks;
tracks.forEach(async track => {
  console.log(track.id);
});
const [tracks] = release.media[0];
console.log(tracks);
tracks.tracks.forEach(t => {
  console.log(t.title, "---", t.id);
});
console.log("**************");
const recording = await mbApi.lookup(
  "recording",
  "7b50adc8-7e3b-36fd-a0c8-c5b524ca7642"
);

console.log("recording: ", recording);
console.log("----- RELEASE -----", release);
const tracks = release.media;
tracks.forEach(track => console.log(track));

console.log(
  "title: ",
  release.title,
  "date: ",
  release.date,
  "status: ",
  release.status,
  "release-event-data: "
);

console.log(release);

const genres = await mbApi.restGet("/genre/all?fmt=txt");

const genres = await mbApi.restGet("/genre/all", {
  offset: "500",
  limit: "10",
});
console.log("genres: ", genres);
const getRelease = await mbApi.lookup(
  "release",
  "2521abbf-618e-454f-ba35-bf6dadf02b11"
);

console.log("getRelease: ", getRelease);
releases.forEach(async release => {
  const tmp = await mbApi.lookup("release", release.id);
  console.log(tmp);
});

console.log("artist: ", artist);
const result = await mbApi.search("release-group", {
  query: "Virgin Prunes",
});
console.log("results: ", result);

queryArtist();

/* 
login
logout
editEntity
addUrlToRecording
addIsrc
restGet
*/

const getArtists = async () => {
  const bowie = await mbApi.lookup(
    "artist",
    "5441c29d-3602-4898-b1a1-b77fa23b8e50"
  );
  const browse = await mbApi.browse("release", {
    query: "8b7bd1c2-be07-3083-989a-714f219f1ff8",
  });
  console.log("Browse: ", browse);
};

getArtists();

queryArtist();
