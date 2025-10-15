import React, { useMemo, useState, useEffect } from 'react'; // react
import UtterTable from './components/UtterTable'; // table
import type { ApiResp, ClipItem, DiarItem, RowItem } from './types'; // types
import { best_match } from './lib/similarity'; // similarity
import { file_name, last_slug, split_kebab, to_kebab, to_public } from './lib/text'; // text utils

const API_ENDPOINT = 'https://files.maila.ai/process/url'; // api endpoint
const MATCH_THRESHOLD = 0.5; // normalized max distance

export default function App() { // app
  const [url, set_url] = useState(''); // input url
  const [loading, set_loading] = useState(false); // loading
  const [notice, set_notice] = useState<string | null>(null); // processing notice
  const [error, set_error] = useState<string | null>(null); // error
  const [rows, set_rows] = useState<RowItem[]>([]); // table rows
  const [folder, set_folder] = useState<string | null>(null); // request folder
  const [audio_file, set_audio_file] = useState<string | null>(null); // full audio
  const [dark, set_dark] = useState<boolean>(false); // dark mode

  useEffect(() => {
    try {
      const stored = localStorage.getItem('prefers-dark');
      if (stored === '1') {
        set_dark(true);
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  }, []);

  const can_submit = useMemo(() => url.trim().length > 0 && !loading, [url, loading]); // can submit

  async function on_submit(e: React.FormEvent) { // submit handler
    e.preventDefault(); // prevent default
    set_error(null); // reset error
    set_loading(true); // set loading
    set_rows([]); // reset rows
    try {
      console.log('POST url len:', url.length); // log
      // show processing notice immediately after user submits
      set_notice('This may take 1–5 minutes to complete.');
      const res = await fetch(API_ENDPOINT, { // fetch
        method: 'POST', // post
        headers: { 'Content-Type': 'application/json' }, // json
        body: JSON.stringify({ url }) // body
      });
      if (!res.ok) { // check ok
        const txt = await res.text().catch(() => ''); // read
        throw new Error(`API error ${res.status}: ${txt}`); // throw
      }
      const data = (await res.json()) as ApiResp; // parse json
      console.log('extracted count:', data.extracted?.length || 0); // log count
      set_folder(data.request_folder || null); // set folder
      set_audio_file(data.audio_file ? to_public(data.audio_file) : null); // set audio url

      const diar_url = to_public(data.diarization_json); // map diar url
      console.log('fetch diar:', diar_url); // log diar url
      const dres = await fetch(diar_url); // fetch diar json
      if (!dres.ok) throw new Error(`Diar fetch ${dres.status}`); // error
      const diar: DiarItem[] = await dres.json(); // diar items
      console.log('utter count:', diar.length); // log utter count

      const clips: ClipItem[] = (data.extracted || []).map(p => { // map clips
        const url = to_public(p); // to public
        const name = file_name(p); // file name
        const utter_slug = last_slug(name); // utter slug
        return { url, file_path: p, file_name: name, utter_slug }; // clip item
      });

      // prepare candidate tokens
      const cand_tokens = clips.map(c => split_kebab(c.utter_slug)); // tokens
      console.log('cand count:', cand_tokens.length); // log count

      // map diar to rows with best match
      const rows_next: RowItem[] = diar.map((d, idx) => { // map items
        const utter_slug = to_kebab(d.utterance); // to kebab
        const tgt = split_kebab(utter_slug); // tokens
        const best = best_match(tgt, cand_tokens); // best match
        let audio_url: string | undefined = undefined; // audio url
        let match_info: RowItem['match_info'] | undefined = undefined; // info
        if (best && best.norm <= MATCH_THRESHOLD) { // within threshold
          const clip = clips[best.idx]; // pick clip
          audio_url = clip.url; // set url
          match_info = { file: clip.file_name, score: best.norm }; // info
        }
        return { // row
          idx, // idx
          speaker: d.speaker_name, // speaker
          utter: d.utterance, // text
          start: d.start, // start
          end: d.end, // end
          dur: d.duration, // duration
          audio_url, // audio
          match_info // info
        };
      });

      set_rows(rows_next); // set rows
      set_notice(null); // clear notice when done
    } catch (err: any) {
      console.error('error:', err?.message || err); // log error
      set_error(err?.message || 'Unknown error'); // set error
    } finally {
      set_loading(false); // clear loading
      // ensure notice is cleared if something went wrong
      // (errors set in catch will also clear loading)
      if (error) set_notice(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6"> {/* container */}
      <header className="flex items-start justify-between gap-4"> {/* header */}
        <div className="space-y-2"> {/* title+subtitle */}
          <h1 className="text-2xl font-semibold">Utterance Extract</h1> {/* title */}
          <p className="text-slate-600 dark:text-slate-400">Paste a video URL. We will process, list utterances, and link available clips.</p> {/* subtitle */}
        </div>
        <div className="flex items-center gap-2"> {/* theme toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !dark;
              set_dark(next);
              try {
                if (next) document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
                localStorage.setItem('prefers-dark', next ? '1' : '0');
              } catch (e) {}
            }}
            className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          >
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <form onSubmit={on_submit} className="flex items-center gap-3"> {/* form */}
        <input
          type="url"
          value={url}
          onChange={e => set_url(e.target.value)}
          placeholder="https://..."
          className="flex-1 px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring focus:ring-slate-200"
        /> {/* url input */}
        <button
          type="submit"
          disabled={!can_submit}
          className="px-4 py-2 rounded bg-slate-900 text-white disabled:opacity-50"
        >
          {loading ? 'Processing…' : 'Process'} {/* label */}
        </button>
      </form>

      {error && ( // error
        <div className="text-sm text-red-600">{error}</div> // error text
      )}

      {(folder || audio_file) && ( // meta
        <div className="text-sm text-slate-600 space-y-2"> {/* meta box */}
          {folder && <div><span className="font-medium">Request:</span> {folder}</div>} {/* folder */}
          {audio_file && ( // full audio
            <div className="flex items-center gap-2"> {/* row */}
              <span className="font-medium">Audio:</span> {/* label */}
              <audio src={audio_file} controls preload="none" className="h-8" /> {/* audio */}
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-3"> {/* table box */}
        {rows.length > 0 ? ( // rows
          <UtterTable rows={rows} /> // table
        ) : (
          <div className="text-sm text-slate-500">No data yet. Submit a URL to begin.</div> // empty
        )}
      </div>

      <footer className="text-xs text-slate-500"> {/* footer */}
        Logs in console show counts and matching distance. {/* note */}
      </footer>
    </div>
  );
}