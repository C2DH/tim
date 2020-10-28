import React, { useCallback, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { connect } from 'react-redux';

import fileDownload from 'js-file-download';
import sanitize from 'sanitize-filename';
import timecode from 'smpte-timecode';
import ObjectToCSV from 'object-to-csv';

import { update, set } from '../reducers/data';

import Transport from './Player/Transport';

import {
  Flex,
  Item,
  ActionButton,
  TextField,
  DialogTrigger,
  Dialog,
  Divider,
  Heading,
  Content,
  ButtonGroup,
  Button,
  Picker,
} from '@adobe/react-spectrum';

import NewItem from '@spectrum-icons/workflow/NewItem';
import OpenRecent from '@spectrum-icons/workflow/OpenRecent';
import SaveFloppy from '@spectrum-icons/workflow/SaveFloppy';
import Export from '@spectrum-icons/workflow/Export';

import Timeline from './Player/Timeline';
import Settings from './Settings';

const time2vtt = time => {
  const tc = new timecode(time, 1e3);
  const [hh, mm, ss, mmm] = tc.toString().split(':');

  return `${hh}:${mm}:${ss}.${mmm}`;
};

const TopBar = ({ player, data: { items, skipIncrement }, set }) => {
  const history = useHistory();
  const { id } = useParams();

  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);
  console.log({ item });
  const { title = '' } = item ?? {};

  const [recent, setRecent] = useState(null);
  const [format, setFormat] = useState('');

  const setTitle = useCallback(title => set([id, 'title', title]), [id, set]);

  const exportItem = useCallback(() => {
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

      // case 'ohms':
      //   fileDownload(JSON.stringify(item, null, 2), `${sanitize(item.title)}.xml`);
      //   break;

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
  }, [format, item]);

  const save = useCallback(() => fileDownload(JSON.stringify(item, null, 2), `${sanitize(item.title)}.json`), [item]);

  return (
    <>
      <Flex direction="row" gap="size-150" margin="size-100">
        <Transport player={player} />

        <TextField aria-label="name" isQuiet flex={1} value={title} isDisabled={!item} onChange={setTitle} />

        <ActionButton isQuiet aria-label="New" onPress={() => history.push('/')}>
          <NewItem />
        </ActionButton>

        <DialogTrigger type="popover">
          <ActionButton isQuiet aria-label="New">
            <OpenRecent />
          </ActionButton>
          {close => (
            <Dialog>
              <Heading>Open recent</Heading>
              <Divider />
              <Content>
                <Picker label="Choose" onSelectionChange={setRecent}>
                  {[...items]
                    .sort(({ updated: a }, { updated: b }) => b - a)
                    .map(({ id, title }) => (
                      <Item key={id}>{title}</Item>
                    ))}
                </Picker>
              </Content>
              <ButtonGroup>
                <Button variant="secondary" onPress={close}>
                  Cancel
                </Button>
                <Button
                  variant="cta"
                  isDisabled={!recent}
                  onPress={() => {
                    close();
                    history.push(`/notes/${recent}`);
                  }}
                >
                  Open
                </Button>
              </ButtonGroup>
            </Dialog>
          )}
        </DialogTrigger>

        <ActionButton isQuiet aria-label="Save" isDisabled={!item} onPress={save}>
          <SaveFloppy />
        </ActionButton>

        <DialogTrigger type="popover">
          <ActionButton isQuiet aria-label="Export" isDisabled={!item}>
            <Export />
          </ActionButton>
          {close => (
            <Dialog>
              <Heading>Export</Heading>
              <Divider />
              <Content>
                <Picker label="Choose format" onSelectionChange={setFormat} selectedKey={format}>
                  <Item key="md">Text (Markdown)</Item>
                  <Item key="csv">CSV</Item>
                  <Item key="ohms">XML (OHMS)</Item>
                  <Item key="vtt">VTT</Item>
                  <Item key="json">JSON</Item>
                </Picker>
              </Content>
              <ButtonGroup>
                <Button variant="secondary" onPress={close}>
                  Cancel
                </Button>
                <Button variant="cta" onPress={exportItem}>
                  Export
                </Button>
              </ButtonGroup>
            </Dialog>
          )}
        </DialogTrigger>

        <Settings />
      </Flex>

      <Timeline {...{ player, item }} />
    </>
  );
};

export default connect(({ data }) => ({ data }), { update, set })(TopBar);
