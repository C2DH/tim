import React from 'react';
import { View, Well } from '@adobe/react-spectrum';

const Intro = () => (
  <View>
    <Well marginX="size-500">
      <p>
        TIM (Timecode Indexing Module) is a tool for indexing and annotation of audio or video recordings, like oral
        history interviews. TIM facilitates the use of media files and available text (e.g., imperfect transcripts) to
        create and export timecode index data into existing multimedia display systems, like 
        <a href="https://www.oralhistoryonline.org/" target="_blank" rel="noopener noreferrer">
          OHMS
        </a>
         and 
        <a href="https://www.aviaryplatform.com/" target="_blank" rel="noopener noreferrer">
          Aviary
        </a>
        . TIM also allows for free-form notetaking for casual users or professional researchers to manage a/v content in
        a timecode-linked environment.
      </p>
      <p>
        The first phase of the TIM project has been sponsored by the{' '}
        <a href="https://www.c2dh.uni.lu/" target="_blank" rel="noopener noreferrer">
          C²DH
        </a>{' '}
        at the{' '}
        <a href="https://wwwen.uni.lu/" target="_blank" rel="noopener noreferrer">
          University of Luxembourg
        </a>
        . The project is led by 
        <a href="https://www.c2dh.uni.lu/people/douglas-lambert" target="_blank" rel="noopener noreferrer">
          Douglas Lambert
        </a>{' '}
        (<a href="mailto:bert@buffalo.edu">bert@buffalo.edu</a>
        ), in partnership with Zack Ellis at{' '}
        <a href="https://theirstory.io/" target="_blank" rel="noopener noreferrer">
          TheirStory
        </a>{' '}
        (<a href="mailto:zack@theirstory.io">zack@theirstory.io</a>
        ), and supported by the C²DH’s 
        <a href="https://www.c2dh.uni.lu/people/lars-wieneke" target="_blank" rel="noopener noreferrer">
          Digital Research Infrastructure
        </a>
         team (contact Lars Wieneke, <a href="mailto:lars.wieneke@uni.lu">lars.wieneke@uni.lu</a>
        ).
      </p>
      <p>
        Many thanks to TIM developers Mark Boas and Laurian Gridinoc at{' '}
        <a href="https://hyperaud.io/" target="_blank" rel="noopener noreferrer">
          Hyperaudio
        </a>
        , to whom we owe an enormous debt of gratitude for taking our project on, and for delivering far beyond what was
        expected.
      </p>
      <img src="assets/hyperaudio.svg" />
      <img src="assets/c2dh_512.jpg" />
      <img src="assets/TheirStory_Logo_Clean.png" />
    </Well>
  </View>
);

export default Intro;
