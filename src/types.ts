// types

export type DiarItem = { speaker_name: string; utterance: string; start: number; end: number; duration: number; }; // diar item

export type ApiResp = { request_folder: string; audio_file: string; diarization_json: string; extracted: string[]; }; // api resp

export type ClipItem = { url: string; file_path: string; file_name: string; utter_slug: string; }; // clip

export type RowItem = { idx: number; speaker: string; utter: string; start: number; end: number; dur: number; audio_url?: string; match_info?: { file: string; score: number; }; }; // table row