import React from 'react'; // react
import type { RowItem } from '../types'; // types

type Props = { rows: RowItem[]; }; // props

const fmt = (n: number) => n.toFixed(2); // number fmt

export default function UtterTable({ rows }: Props) { // table
  return (
    <div className="overflow-x-auto"> {/* scroll */}
      <table className="min-w-full text-sm"> {/* table */}
        <thead className="text-left bg-slate-100"> {/* header */}
          <tr> {/* row */}
            <th className="px-3 py-2">#</th> {/* idx */}
            <th className="px-3 py-2">Speaker</th> {/* speaker */}
            <th className="px-3 py-2">Start–End</th> {/* time */}
            <th className="px-3 py-2">Dur</th> {/* dur */}
            <th className="px-3 py-2">Utterance</th> {/* text */}
            <th className="px-3 py-2">Clip</th> {/* clip */}
          </tr>
        </thead>
        <tbody> {/* body */}
          {rows.map(r => (
            <tr key={r.idx} className="border-b last:border-none"> {/* row */}
              <td className="px-3 py-2 text-slate-500">{r.idx + 1}</td> {/* idx */}
              <td className="px-3 py-2 font-medium">{r.speaker}</td> {/* speaker */}
              <td className="px-3 py-2 tabular-nums">{fmt(r.start)}–{fmt(r.end)}</td> {/* time */}
              <td className="px-3 py-2 tabular-nums">{fmt(r.dur)}</td> {/* dur */}
              <td className="px-3 py-2">{r.utter}</td> {/* utter */}
              <td className="px-3 py-2">
                {r.audio_url ? ( // has audio
                  <div className="flex items-center gap-2"> {/* row */}
                    <audio src={r.audio_url} controls preload="none" className="h-8"> {/* audio */}
                      Your browser does not support audio. {/* fallback */}
                    </audio>
                    {r.match_info && ( // match
                      <span className="text-xs text-slate-500">dist {r.match_info.score.toFixed(2)}</span> // score
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">no clip</span> // no clip
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}