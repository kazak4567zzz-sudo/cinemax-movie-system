const REMOTE_API_BASE = 'https://cinemax-api-2maf.onrender.com/api';
const AUTH_API_BASE = 'https://cinemax-auth.hazahan70.workers.dev/api';
const API_BASE = window.CINEMAX_LOCAL_API === true ? 'http://localhost:5000/api' : REMOTE_API_BASE;

async function backendFetch(path, options) {
  try {
    return await fetch(`${API_BASE}${path}`, options);
  } catch (error) {
    if (API_BASE === REMOTE_API_BASE) throw error;
    return fetch(`${REMOTE_API_BASE}${path}`, options);
  }
}

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p';
const TMDB_TOKEN_KEY = 'cinemax_tmdb_token';

const FALLBACK_GENRES = [
  { genreID: 1, genreName: 'Sci-Fi' }, { genreID: 2, genreName: 'Drama' },
  { genreID: 3, genreName: 'Action' }, { genreID: 4, genreName: 'Thriller' },
  { genreID: 5, genreName: 'Adventure' }
];

const FALLBACK_MOVIES = [
  { movieID:1,title:'Inception',releaseYear:2010,durationMinutes:148,genreID:1,genreName:'Sci-Fi',rating:8.8,directorName:'Christopher Nolan',countryName:'USA',languageName:'EN',ageRestriction:'PG-13',productionCompany:'Warner Bros.',description:'A skilled thief enters dreams to steal secrets and faces an impossible mission: planting an idea in a target’s mind.',posterUrl:'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',trailerUrl:'YoHD9XEInc0',budget:160000000,boxOffice:836800000,discountPercent:20,subtitleAvailable:true,is3D:false },
  { movieID:2,title:'Titanic',releaseYear:1997,durationMinutes:194,genreID:2,genreName:'Drama',rating:7.9,directorName:'James Cameron',countryName:'USA',languageName:'EN',ageRestriction:'PG-13',productionCompany:'Paramount Pictures',description:'A young aristocrat falls in love with an artist aboard the ill-fated RMS Titanic.',posterUrl:'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',trailerUrl:'2e-eXJ6HgkQ',budget:200000000,boxOffice:2187000000,discountPercent:15,subtitleAvailable:true,is3D:true },
  { movieID:3,title:'Interstellar',releaseYear:2014,durationMinutes:169,genreID:1,genreName:'Sci-Fi',rating:8.6,directorName:'Christopher Nolan',countryName:'USA',languageName:'EN',ageRestriction:'PG-13',productionCompany:'Paramount Pictures',description:'Explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',posterUrl:'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',trailerUrl:'zSWdZVtXT7E',budget:165000000,boxOffice:773000000,discountPercent:10,subtitleAvailable:true,is3D:false },
  { movieID:4,title:'Avatar',releaseYear:2009,durationMinutes:162,genreID:5,genreName:'Adventure',rating:7.9,directorName:'James Cameron',countryName:'USA',languageName:'EN',ageRestriction:'PG-13',productionCompany:'20th Century Fox',description:'A marine on Pandora becomes torn between his orders and protecting the world he now calls home.',posterUrl:'https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg',trailerUrl:'5PSNL1qE6VY',budget:237000000,boxOffice:2923000000,discountPercent:5,subtitleAvailable:true,is3D:true },
  { movieID:5,title:'The Dark Knight',releaseYear:2008,durationMinutes:152,genreID:3,genreName:'Action',rating:9.0,directorName:'Christopher Nolan',countryName:'USA',languageName:'EN',ageRestriction:'PG-13',productionCompany:'Warner Bros.',description:'Batman faces the Joker, a criminal mastermind who plunges Gotham into chaos.',posterUrl:'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',trailerUrl:'EXeTwQWrcwY',budget:185000000,boxOffice:1005000000,discountPercent:0,subtitleAvailable:true,is3D:false },
  { movieID:6,title:'The Shawshank Redemption',releaseYear:1994,durationMinutes:142,genreID:2,genreName:'Drama',rating:9.3,directorName:'Frank Darabont',countryName:'USA',languageName:'EN',ageRestriction:'R',productionCompany:'Castle Rock Entertainment',description:'Two imprisoned men find friendship, hope and redemption over many years.',posterUrl:'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',trailerUrl:'6hB3S9bIaco',budget:25000000,boxOffice:58300000,discountPercent:30,subtitleAvailable:true,is3D:false },
  { movieID:7,title:'Oppenheimer',releaseYear:2023,durationMinutes:180,genreID:2,genreName:'Drama',rating:8.5,directorName:'Christopher Nolan',countryName:'USA',languageName:'EN',ageRestriction:'R',productionCompany:'Universal Pictures',description:'The story of J. Robert Oppenheimer and his role in developing the atomic bomb.',posterUrl:'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',trailerUrl:'uYPbbksJxIg',budget:100000000,boxOffice:952000000,discountPercent:0,subtitleAvailable:true,is3D:false },
  { movieID:8,title:'Dune',releaseYear:2021,durationMinutes:155,genreID:1,genreName:'Sci-Fi',rating:8.0,directorName:'Denis Villeneuve',countryName:'USA',languageName:'EN',ageRestriction:'PG-13',productionCompany:'Warner Bros.',description:'A gifted young man must travel to the most dangerous planet in the universe to secure his family’s future.',posterUrl:'https://image.tmdb.org/t/p/w500/d5NXSklpcKqgCghQ6o9PAN0m1gu.jpg',trailerUrl:'8g18jFHCLXk',budget:165000000,boxOffice:401800000,discountPercent:10,subtitleAvailable:true,is3D:true },
  { movieID:9,title:'The Wolf of Wall Street',releaseYear:2013,durationMinutes:180,genreID:2,genreName:'Drama',rating:8.2,directorName:'Martin Scorsese',countryName:'USA',languageName:'EN',ageRestriction:'R',productionCompany:'Paramount Pictures',description:'The rise and fall of stockbroker Jordan Belfort amid corruption and excess.',posterUrl:'https://image.tmdb.org/t/p/w500/pWHf4khOloNVfCxscsXFj3jj6gP.jpg',trailerUrl:'iszwuX1AK6A',budget:100000000,boxOffice:392000000,discountPercent:15,subtitleAvailable:true,is3D:false },
  { movieID:10,title:'Mad Max: Fury Road',releaseYear:2015,durationMinutes:120,genreID:3,genreName:'Action',rating:8.1,directorName:'George Miller',countryName:'Australia',languageName:'EN',ageRestriction:'R',productionCompany:'Warner Bros.',description:'In a ruined wasteland, rebels flee a tyrant in a roaring war rig.',posterUrl:'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',trailerUrl:'hEJnMQG9ev8',budget:185000000,boxOffice:375400000,discountPercent:20,subtitleAvailable:true,is3D:false }
].map(movie => ({ ...movie, mainActorName:'', actors:[], reviews:[], iMDbRating:movie.rating, rottenTomatoes:null, _source:'fallback' }));

function fallbackGet(path) {
  if (path === '/genres') return FALLBACK_GENRES;
  if (path === '/actors' || path === '/directors' || path === '/countries') return [];
  const movieMatch = path.match(/^\/movies\/(\d+)$/);
  if (movieMatch) return FALLBACK_MOVIES.find(movie => movie.movieID === Number(movieMatch[1]));
  return undefined;
}

function fallbackMovieList(path) {
  const input = new URLSearchParams(path.split('?')[1] || '');
  const search = (input.get('search') || '').toLowerCase();
  const genreId = Number(input.get('genreId') || 0);
  const year = Number(input.get('year') || 0);
  const page = Math.max(1, Number(input.get('page') || 1));
  const pageSize = Math.max(1, Number(input.get('pageSize') || 12));
  let movies = FALLBACK_MOVIES.filter(movie => (!search || `${movie.title} ${movie.description}`.toLowerCase().includes(search)) && (!genreId || movie.genreID === genreId) && (!year || movie.releaseYear === year));
  const sortBy = input.get('sortBy');
  movies.sort((a,b) => sortBy === 'year' ? b.releaseYear-a.releaseYear : sortBy === 'title' ? a.title.localeCompare(b.title) : b.rating-a.rating);
  return { data: movies.slice((page-1)*pageSize,page*pageSize), total: movies.length };
}

const catalog = {
  get token() { return localStorage.getItem(TMDB_TOKEN_KEY)?.trim() || ''; },
  get enabled() { return Boolean(this.token); },
  language() {
    const lang = localStorage.getItem('cinemax_lang') || 'en';
    return lang === 'ru' ? 'ru-RU' : lang === 'kz' ? 'kk-KZ' : 'en-US';
  },
  async request(path, params = {}) {
    if (!this.token) throw new Error('TMDB token is not configured');
    const query = new URLSearchParams({ language: this.language(), ...params });
    const res = await fetch(`${TMDB_BASE}${path}?${query}`, {
      headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/json' }
    });
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return res.json();
  },
  image(path, size = 'w500') { return path ? `${TMDB_IMAGE}/${size}${path}` : ''; },
  movie(item, genres = {}) {
    const genreNames = item.genres?.map(g => g.name) || item.genre_ids?.map(id => genres[id]) || [];
    return {
      movieID: item.id,
      title: item.title || item.original_title || 'Untitled',
      description: item.overview || 'Description is not available yet.',
      releaseYear: Number((item.release_date || '').slice(0, 4)) || 0,
      durationMinutes: item.runtime || 0,
      rating: Number(item.vote_average || 0),
      genreID: item.genres?.[0]?.id || item.genre_ids?.[0] || null,
      genreName: genreNames.filter(Boolean).join(', ') || 'Movie',
      posterUrl: this.image(item.poster_path),
      backdropUrl: this.image(item.backdrop_path, 'original'),
      languageName: (item.original_language || '').toUpperCase(),
      productionCompany: item.production_companies?.map(x => x.name).join(', ') || '',
      countryName: item.production_countries?.map(x => x.name).join(', ') || '',
      budget: item.budget || 0,
      boxOffice: item.revenue || 0,
      discountPercent: 0,
      ageRestriction: this.certification(item.release_dates),
      subtitleAvailable: true,
      is3D: false,
      _source: 'tmdb'
    };
  },
  certification(releaseDates) {
    const countries = releaseDates?.results || [];
    const preferred = countries.find(x => x.iso_3166_1 === 'US') || countries[0];
    return preferred?.release_dates?.find(x => x.certification)?.certification || 'NR';
  },
  pickVideos(videos) {
    const list = (videos?.results || []).filter(v => v.site === 'YouTube');
    return list.sort((a, b) => Number(b.official) - Number(a.official) ||
      (a.type === 'Trailer' ? -1 : 1) - (b.type === 'Trailer' ? -1 : 1)).slice(0, 8);
  },
  providers(data) {
    const all = data?.results || {};
    const locale = (localStorage.getItem('cinemax_country') || 'KZ').toUpperCase();
    const selected = all[locale] || all.US || Object.values(all)[0];
    if (!selected) return { country: locale, link: '', items: [] };
    const groups = [
      ['stream', selected.flatrate || selected.free || selected.ads || []],
      ['rent', selected.rent || []],
      ['buy', selected.buy || []]
    ];
    const seen = new Set();
    return {
      country: all[locale] ? locale : (all.US ? 'US' : locale),
      link: selected.link || '',
      items: groups.flatMap(([type, items]) => items.map(p => ({
        type, id: p.provider_id, name: p.provider_name, logo: this.image(p.logo_path, 'w92')
      }))).filter(p => !seen.has(p.id) && seen.add(p.id))
    };
  },
  async genres() {
    const data = await this.request('/genre/movie/list');
    return data.genres.map(g => ({ genreID: g.id, genreName: g.name }));
  },
  async list(path) {
    const raw = path.split('?')[1] || '';
    const input = new URLSearchParams(raw);
    const page = input.get('page') || '1';
    const search = input.get('search')?.trim();
    const genreId = input.get('genreId');
    const year = input.get('year');
    const sortMap = { rating: 'vote_average.desc', year: 'primary_release_date.desc', title: 'title.asc' };
    const params = { page, include_adult: 'false' };
    let endpoint = '/discover/movie';
    if (search) {
      endpoint = '/search/movie';
      params.query = search;
    } else {
      params.sort_by = sortMap[input.get('sortBy')] || 'popularity.desc';
      if (genreId) params.with_genres = genreId;
      if (year) params.primary_release_year = year;
      if (params.sort_by === 'vote_average.desc') params['vote_count.gte'] = '250';
    }
    const [data, genreData] = await Promise.all([this.request(endpoint, params), this.request('/genre/movie/list')]);
    const genres = Object.fromEntries(genreData.genres.map(g => [g.id, g.name]));
    return { data: data.results.map(m => this.movie(m, genres)), total: Math.min(data.total_results || 0, 10000) };
  },
  async detail(id) {
    const [item, providers, similar] = await Promise.all([
      this.request(`/movie/${id}`, { append_to_response: 'videos,credits,release_dates' }),
      this.request(`/movie/${id}/watch/providers`, {}),
      this.request(`/movie/${id}/similar`, { page: 1 })
    ]);
    const movie = this.movie(item);
    const videos = this.pickVideos(item.videos);
    const director = item.credits?.crew?.find(x => x.job === 'Director');
    movie.trailerUrl = videos[0]?.key || '';
    movie.videos = videos.map(v => ({ key: v.key, name: v.name, type: v.type, official: v.official }));
    movie.directorName = director?.name || 'Unknown';
    movie.directorID = director?.id || null;
    movie.mainActorName = item.credits?.cast?.[0]?.name || '';
    movie.actors = (item.credits?.cast || []).slice(0, 12).map(a => ({
      actorID: a.id, fullName: a.name, roleName: a.character, photoUrl: this.image(a.profile_path, 'w342'),
      age: '', countryName: '', oscarAwards: 0
    }));
    movie.providers = this.providers(providers);
    movie.similar = (similar.results || []).slice(0, 8).map(x => this.movie(x));
    movie.reviews = JSON.parse(localStorage.getItem(`cinemax_tmdb_reviews_${id}`) || '[]');
    return movie;
  }
};

const api = {
  async get(path) {
    if (catalog.enabled && path === '/genres') return catalog.genres();
    if (catalog.enabled && /^\/movies\/\d+$/.test(path)) return catalog.detail(path.split('/').pop());
    try {
      const res = await backendFetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (error) {
      const fallback = fallbackGet(path);
      if (fallback !== undefined) return fallback;
      throw error;
    }
  },
  async getWithHeaders(path) {
    if (catalog.enabled && path.startsWith('/movies?')) return catalog.list(path);
    try {
      const res = await backendFetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const total = res.headers.get('X-Total-Count');
      return { data, total: parseInt(total || '0') };
    } catch (error) {
      if (path.startsWith('/movies?')) return fallbackMovieList(path);
      throw error;
    }
  },
  async post(path, body) {
    const res = await backendFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async put(path, body) {
    const res = await backendFetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.status === 204 ? null : res.json();
  },
  async delete(path) {
    const res = await backendFetch(path, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

function showToast(msg, type = 'success') {
  const tc = document.getElementById('toastContainer');
  if (!tc) return;
  const t = document.createElement('div');
  t.className = `toast-item ${type}`;
  t.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'x-circle-fill'}"></i> ${msg}`;
  tc.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function formatMoney(n) {
  if (!n) return 'N/A';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(0) + 'M';
  return '$' + n.toLocaleString();
}

function formatDate(d) {
  if (!d) return '';
  const locale = (typeof currentLang !== 'undefined')
    ? (currentLang === 'ru' ? 'ru-RU' : currentLang === 'kz' ? 'kk-KZ' : 'en-US')
    : 'en-US';
  return new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

function ratingStars(r) {
  const full = Math.round(r / 2);
  return Array.from({length: 5}, (_, i) =>
    `<i class="bi bi-star${i < full ? '-fill' : ''}" style="color:${i < full ? '#f5c518' : '#555'}; font-size:12px;"></i>`
  ).join('');
}
