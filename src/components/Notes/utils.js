import { v4 as uuidv4 } from 'uuid';
import rtf2text from 'rtf2text';
import mammoth from 'mammoth';

export const parse = (file, format) => {
  switch (format) {
    case 'text':
      return new Promise((resolve, reject) => {
        try {
          fetch(window.URL.createObjectURL(file)).then(response => {
            console.log({ response });
            if (response.ok) {
              response.text().then(text => {
                console.log(text);
                resolve({
                  id: uuidv4(),
                  title: `Note ${new Date().toISOString()}`,
                  url: null,
                  notes: text.split(/\r?\n/).map(line => ({
                    children: [{ text: line }],
                  })),

                  metadata: [],
                  created: Date.now(),
                  updated: Date.now(),
                });
              });
            } else reject();
          });
        } catch (error) {
          reject(error);
        }
      });

    case 'rtf':
      return new Promise((resolve, reject) => {
        try {
          fetch(window.URL.createObjectURL(file)).then(response => {
            console.log({ response });
            if (response.ok) {
              response.text().then(text => {
                rtf2text.string(text, (err, text) => {
                  if (err) return reject(err);
                  console.log(text);

                  resolve({
                    id: uuidv4(),
                    title: `Note ${new Date().toISOString()}`,
                    url: null,
                    notes: text.split(/\r?\n/).map(line => ({
                      children: [{ text: line }],
                    })),

                    metadata: [],
                    created: Date.now(),
                    updated: Date.now(),
                  });
                });
              });
            } else reject();
          });
        } catch (error) {
          reject(error);
        }
      });

    case 'docx':
      return new Promise((resolve, reject) => {
        try {
          fetch(window.URL.createObjectURL(file)).then(response => {
            if (response.ok) {
              response.arrayBuffer().then(arrayBuffer => {
                mammoth
                  .extractRawText({ arrayBuffer })
                  .then(result => {
                    const text = result.value;
                    result.messages.forEach(message => console.warn(message));
                    console.log(text);

                    resolve({
                      id: uuidv4(),
                      title: `Note ${new Date().toISOString()}`,
                      url: null,
                      notes: text.split(/\r?\n/).map(line => ({
                        children: [{ text: line }],
                      })),

                      metadata: [],
                      created: Date.now(),
                      updated: Date.now(),
                    });
                  })
                  .done();
              });
            } else reject();
          });
        } catch (error) {
          reject(error);
        }
      });

    case 'json':
      return new Promise((resolve, reject) => {
        try {
          fetch(window.URL.createObjectURL(file)).then(response => {
            console.log({ response });
            if (response.ok) {
              response.text().then(text => {
                try {
                  const json = JSON.parse(text);
                  // TODO validate JSON
                  resolve(json);
                } catch (e) {
                  reject(e);
                }
              });
            } else reject();
          });
        } catch (error) {
          reject(error);
        }
      });
    default:
      console.warn('format not handled', format);
      throw new Error('format not handled');
  }
};
