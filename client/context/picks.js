import React from 'react';

export const PicksContext = React.createContext({
  articles: {},
  pick: (address, payload) => {},
  unpick: (address) => {},
  unpickAll: () => {},
});
