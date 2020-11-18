const { ApolloServer, gql } = require('apollo-server-lambda')
const  faunadb  = require('faunadb')
const q = faunadb.query;

const typeDefs = gql`
  type Query {
    bookmark : [Bookmark!]
  }
  type Bookmark {
    id: ID!
    url: String!
    desc: String!
  }
  type Mutation {
    addBookmark(url: String!, desc : String!) : Bookmark
  }
`

const authors = [
  { id: 1, url: 'Yahoo.com', desc: 'news, mail and search engine' },
  { id: 2, url: 'Google.com', desc: 'search engine' },
  { id: 3, url: 'newsnow.com', desc: 'news' },
]

const resolvers = {
  Query: {
    bookmark : async (root, args, context) => {
      // return authors
      // const client = new faunadb.Client({'secret' : 'fnAD4WspdcACAZNBJB4bsHTdWy_AlTBNBabJNXPv'}) // working (Bootcamp)

      // const client = new faunadb.Client({'secret' : 'fnAD6182dEACAvCTrj-ZWyzNxs5_kNcRDcsBDusY'}) //  working

      const client = new faunadb.Client({'secret' : 'fnAD61-NQjACA2hs1xp7B-hcs9l52c1rPJaV104i'}) //  working

      // const client = new faunadb.Client({'secret' : 'fnAD61_K-wACA2E0EgHMFOfJJB9VFQTpqeDVS2yg'}) // not working

      // const client = new faunadb.Client({'secret' : 'fnAD4EzjyPACCXxpMpqhwms3zrrTcE63VRb5V7HF'})//Not working
      // const client = new faunadb.Client({'secret' : 'fnAD4DAEOmACBj--j-cpXzm28qVb0s7_t2mDw0o1'}) //Not working 
      try {
        var result = await client.query(
          q.Map(
            q.Paginate(q.Match(q.Index('urltest1'))),
            q.Lambda(x => q.Get(x))
          )
        )
        // console.log('result  ', result.data );

       return result.data.map(d => {
        return {
          id: d.ts,
          url: d.data.url,
          desc: d.data.desc
        }
      })
    

      } catch(error) {
        console.log('Not getting  ', error)
      }

    }    
    // authorByName: (root, args, context) => {
    //   console.log('hihhihi', args.name)
    //   return authors.find(x => x.name === args.name) || 'NOTFOUND'
    // },
  },
  Mutation: {
      addBookmark : async(_, {url, desc})  => {
        console.log('url ----- desc  ', url, "   ", desc);

        var client = new faunadb.Client({'secret' : 'fnAD4EzjyPACCXxpMpqhwms3zrrTcE63VRb5V7HF'})
       
       try{   
            // var result = await client.query( q.CreateCollection({name : 'links' })   ) 

        var result = await client.query(
          q.Create( q.Collection('links'), { data : {url, desc} } )

          // q.CreateIndex( {
          //   name : 'url',
          //   source : q.Collection('links'),
          //   terms : [ {field :  [url, desc] } ],
          //  })
        )

        return result.ref.data;
        console.log('Created and id is  ', result.ref.id);
      } catch(error) {
            console.log(' not created  ', error);
        }
    }
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

exports.handler = server.createHandler()
