import { MusicBrainzApi } from "musicbrainz-api";

const config = {
  baseUrl: "https://musicbrainz.org",
  appName: "musicplayer-electron",
  appVersion: "1.0.0",
  appMail: "myxy9@proton.me",
};

const mbApi = new MusicBrainzApi(config);

const result = await mbApi.search("release-group", {
  query: "David Bowie AND Low",
  limit: "5",
});

/*  console.log(result);  */

const releases = [];

result["release-groups"].forEach(async rg => {
  console.log(rg.releases);
  console.log("--------------");
  //releases.push(rg.releases[0]);
});

const rel1 = await mbApi.lookup(
  "release",
  "57e8f0fd-f932-4aac-b881-7f0074726531",
  ["media", "recordings"]
);
//const rel1 = await mbApi.browse("recording", { query: releases[0] });
//console.log(releases[0]);

console.log("rel1: ", rel1.media[0]);
