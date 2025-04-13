// @ts-nocheck

// Define the announcement type
export interface Announcement {
  id: string;
  eyebrowText?: string;
  headline: string;
  announcementType: string;
  publishDate: string;
  unpublishDate?: string;
  description: any; // Contentful Rich Text object
}

// Define the sports ticker types
export interface Game {
  id: string;
  opponent: string;
  location: 'Home' | 'Away';
  scsScore: string;
  opponentScore: string;
  date: string;
  place?: number;
}

export interface Team {
  id: string;
  name: string;
  games: Game[];
}

export interface SportsTicker {
  id: string;
  teams: Team[];
}

export interface Gallery {
  photoGallery: any;
}

// Ensure we have the required environment variables
if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_DELIVERY_TOKEN) {
  console.error('Missing required Contentful environment variables');
}

const GRAPHQL_ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`;

const announcementQuery = `
  query GetAnnouncements($now: DateTime!) {
    announcementCollection(
      where: {
        publishDate_lte: $now,
        OR: [
          { unpublishDate_gt: $now },
          { unpublishDate_exists: false }
        ]
      },
      order: [publishDate_DESC]
    ) {
      items {
        sys {
          id
        }
        headline
        announcementType
        eyebrowText
        publishDate
        unpublishDate
        description {
          json
        }
      }
    }
  }
`;

const sportsTickerQuery = `
  query GetSportsTicker {
    sportsTickerCollection(limit: 1) {
      items {
        sys {
          id
        }
        teamsCollection {
          items {
            sys {
              id
            }
            team
            gamesCollection {
              items {
                __typename
                ...on Game {
                  sys {
                    id
                  }
                  opponent
                  location
                  scsScore
                  opponentScore
                  date
                }
                ...on Meet {
                  sys {
                    id
                  }
                  date
                  place
                }
              }
            }
          }
        }
      }
    }
  }
`;

const photoGalleryQuery = `
  query GetPhotoGallery {
    galleryCollection(limit: 1) {
      items {
        galleryItemsCollection {
          items {
            ...on GalleryItem {
              media {
                url
                title
              }
            }
          }
        }
      }
    }
  }
`;

// Fetch announcements from Contentful
export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const now = new Date().toISOString();
    
    // Debug environment variables
    console.log("Contentful Space ID:", process.env.CONTENTFUL_SPACE_ID ? "Set" : "Not set");
    console.log("Contentful Delivery Token:", process.env.CONTENTFUL_DELIVERY_TOKEN ? "Set" : "Not set");
    
    // Debug GraphQL endpoint
    console.log("GraphQL Endpoint:", GRAPHQL_ENDPOINT);

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`,
      },
      body: JSON.stringify({
        query: announcementQuery,
        variables: { now },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Contentful API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch announcements: ${response.status} ${response.statusText}`);
    }

    const { data } = await response.json();

    return data.announcementCollection.items.map((item: any) => ({
      id: item.sys.id,
      headline: item.headline,
      description: item.description,
      announcementType: item.announcementType,
      eyebrowText: item.eyebrowText,
      publishDate: item.publishDate,
      unpublishDate: item.unpublishDate,
      // image: item.image,
    }));
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

// Fetch sports ticker data from Contentful
export async function getSportsTicker(): Promise<SportsTicker | null> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`,
      },
      body: JSON.stringify({
        query: sportsTickerQuery,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Contentful API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch sports ticker: ${response.status} ${response.statusText}`);
    }

    const { data } = await response.json();
    
    if (!data.sportsTickerCollection.items.length) {
      return null;
    }

    const tickerData = data.sportsTickerCollection.items[0];
    
    // Transform the data to match our interface
    return {
      id: tickerData.sys.id,
      teams: tickerData.teamsCollection.items.map((team: any) => ({
        id: team.sys.id,
        name: team.team,
        games: team.gamesCollection.items.map((game: any) => ({
          id: game.sys.id,
          opponent: game.opponent,
          location: game.location,
          scsScore: game.scsScore,
          opponentScore: game.opponentScore,
          date: game.date,
          place: game.place,
        })),
      })),
    };
  } catch (error) {
    console.error('Error fetching sports ticker:', error);
    return null;
  }
} 


export async function getPhotoGallery(): Promise<Gallery | null> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`,
      },
      body: JSON.stringify({
        query: photoGalleryQuery,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Contentful API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch gallery: ${response.status} ${response.statusText}`);
    }

    const { data } = await response.json();
    
    if (!data.galleryCollection.items.length) {
      return null;
    }

    const galleryData = data.galleryCollection.items[0].galleryItemsCollection.items;
    // galleryCollection(limit: 1) {
    //   items {
    //     galleryItemsCollection {
    //       items {
    //         ...on GalleryItem {
    //           media {
    //             url
    
    // Transform the data to match our interface
    return {
      photoGallery: galleryData,
    };
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return null;
  }
} 