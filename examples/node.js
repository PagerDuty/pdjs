// How to use pdjs in a node environment
// This example will list users contact info.
const PagerDuty = require('../build/src/index.js');

const pd = PagerDuty.api({token: 'y_NbAkKc66ryYTWUXYEu', tokenType: 'token'});
pd.get('/users', {params: {'include[]': 'contact_methods'}})
  .then(({resource}) => {
    // The Users are returned in the `resource` key.
    resource.forEach(user => {
      console.log(`${user['name']}: ${user['email']}`);
    });
  })
  .catch(console.error);
