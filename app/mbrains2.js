import { MusicBrainzApi } from "musicbrainz-api";

const config = {
  baseUrl: "https://musicbrainz.org",
  appName: "musicplayer-electron",
  appVersion: "1.0.0",
  appMail: "myxy9@proton.me",
};

const mbApi = new MusicBrainzApi(config);

const queryArtist = async () => {
  try {
    const artists = await mbApi.search("artist", { query: "David AND Bowie" });
    const artistMbid = artists.artists[0].id;
    const artist = await mbApi.lookup("artist", artistMbid, ["release-groups"]);
    console.log(
      /*     "artists: ",
      artists,
      "artistMbid: ",
      artistMbid, */
      "artist release groups: ",
      artist["release-groups"].forEach(group => {
        console.log(group.title);
      })
    );
  } catch (err) {
    console.error(err);
  }
};

queryArtist();
