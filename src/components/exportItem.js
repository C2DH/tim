import fileDownload from 'js-file-download';
import sanitize from 'sanitize-filename';
import timecode from 'smpte-timecode';
import ObjectToCSV from 'object-to-csv';
import { DOMParser, XMLSerializer } from 'xmldom';

// from https://github.com/cookpete/react-player/blob/master/src/patterns.js#L3
const MATCH_URL_YOUTUBE = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//;

const OHMSNS = 'https://www.weareavp.com/nunncenter/ohms';

/**
 * Generates webVTT timestamp
 *
 * @param {number} time seconds
 * @return {string} hh:mm:ss.mmm timecode
 */
const time2vtt = time => {
  const tc = new timecode(time, 1e3);
  const [hh, mm, ss, mmm] = tc.toString().split(':');

  return `${hh}:${mm}:${ss}.${mmm}`;
};

/**
 * Item export: conversion to specified format and trigger download
 *
 * @param {Object} item
 * @param {string} format
 * @param {boolean} partialTranscript
 */
const exportItem = (item, format, partialTranscript) => {
  switch (format) {
    case 'json':
      fileDownload(JSON.stringify(item, null, 2), `${sanitize(item.title)}.json`);
      break;

    case 'md':
      fileDownload(
        item.notes.map(({ children }) => children.map(({ text }, index) => text).join('\n')).join('\n'),
        `${sanitize(item.title)}.txt`
      );
      break;

    case 'ohms':
      const doc = new DOMParser().parseFromString(`<?xml version="1.0" encoding="UTF-8"?>
      <ROOT xmlns="https://www.weareavp.com/nunncenter/ohms" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.weareavp.com/nunncenter/ohms/ohms.xsd">
        <record id="" dt="">
          <version>5.4</version>
          <date value="" format="yyyy-mm-dd"/>
          <date_nonpreferred_format/>
          <title>TITLE</title>
          <media_id/>
          <media_url>URL</media_url>
          <mediafile>
            <host>Other</host>
            <avalon_target_domain/>
            <host_account_id/>
            <host_player_id/>
            <host_clip_id/>
            <clip_format>video</clip_format>
          </mediafile>
          <index></index>
        </record>
      </ROOT>`);

      const mediaUrlEl = doc.getElementsByTagName('media_url')[0];
      mediaUrlEl.textContent = item.url;

      const titleEl = doc.getElementsByTagName('title')[0];
      titleEl.textContent = item.title;

      const recordEl = doc.getElementsByTagName('record')[0];
      recordEl.setAttribute('id', item.id);
      recordEl.setAttribute('dt', new Date(item.updated).toISOString().split('T')[0]);

      const dateEl = doc.getElementsByTagName('date')[0];
      dateEl.setAttribute('value', new Date(item.updated).toISOString().split('T')[0]);

      const indexEl = doc.getElementsByTagName('index')[0];

      item.metadata.forEach(({ time, title, synopsis, notes, keywords }) => {
        console.log({ time, title, synopsis, notes, keywords });
        const pointEl = doc.createElementNS(OHMSNS, 'point');

        const timeEl = doc.createElementNS(OHMSNS, 'time');
        pointEl.appendChild(timeEl);
        timeEl.textContent = time;

        const titleEl = doc.createElementNS(OHMSNS, 'title');
        pointEl.appendChild(titleEl);
        titleEl.textContent = title;

        const synopsisEl = doc.createElementNS(OHMSNS, 'synopsis');
        pointEl.appendChild(synopsisEl);
        synopsisEl.textContent = synopsis;

        if (partialTranscript) {
          const partialTranscriptEl = doc.createElementNS(
            OHMSNS,
            'partial_transcript'
          );
          pointEl.appendChild(partialTranscriptEl);
          partialTranscriptEl.textContent = notes;
        }

        if (MATCH_URL_YOUTUBE.test(item.url)) {
          const hostEl = doc.getElementsByTagName('host')[0];
          hostEl.textContent = 'YouTube';
        }

        const keywordsEl = doc.createElementNS(OHMSNS, 'keywords');
        pointEl.appendChild(keywordsEl);
        keywordsEl.textContent = keywords.split(',').join(';');

        indexEl.appendChild(pointEl);
      });

      fileDownload(new XMLSerializer().serializeToString(doc), `${sanitize(item.title)}.xml`);
      break;

    case 'vtt':
      const segments = item.metadata.map(({ time: start, title, synopsis: text }, index, array) => ({
        start,
        end: index < array.length - 1 ? array[index + 1].time : start + 3600,
        title,
        text,
      }));
      const vtt = [
        'WEBVTT',
        ...segments.map(({ title, start, end, text }) =>
          [title, `${time2vtt(start)} --> ${time2vtt(end)}`, text].join('\n')
        ),
      ];

      fileDownload(vtt.join('\n\n'), `${sanitize(item.title)}.vtt`);
      break;

    case 'csv':
      const data = item.metadata.map(({ timecode, time, title, synopsis, keywords, notes }) => ({
        timecode,
        time,
        title,
        synopsis,
        keywords,
        notes,
      }));

      const otc = new ObjectToCSV({
        keys: [
          { key: 'timecode', as: 'Timecode' },
          { key: 'time', as: 'Time' },
          { key: 'title', as: 'Title' },
          { key: 'keywords', as: 'Keywords' },
          { key: 'synopsis', as: 'Synopsis' },
          { key: 'notes', as: 'Notes' },
        ],
        data,
      });

      fileDownload(otc.getCSV(), `${sanitize(item.title)}.csv`);
      break;

    default:
      console.warn('format not handled', format);
  }
};

export default exportItem;
