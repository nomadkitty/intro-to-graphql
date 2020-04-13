import { ApolloServer } from 'apollo-server'
import { loadTypeSchema } from './utils/schema'
import { authenticate } from './utils/auth'
import { merge } from 'lodash'
import config from './config'
import { connect } from './db'
import product from './types/product/product.resolvers'
import coupon from './types/coupon/coupon.resolvers'
import user from './types/user/user.resolvers'

const types = ['product', 'coupon', 'user']

export const start = async () => {
  const rootSchema = `
    type Cat {
      name: string
      age: int
    }
    
    type Query {
      cat: Cat
      cats: [cat]!
    }

    schema {
      query: Query
      mutation: Mutation
    }
  `
  const schemaTypes = await Promise.all(types.map(loadTypeSchema))
  const catResolver = {
    Query: {
      cat() {
        return { name: 'Theo', age: 14 }
      },
      cats() {
        return [
          { name: 'Theo', age: 14 },
          { name: 'Dingo', age: 2 }
        ]
      }
    }
  }

  const server = new ApolloServer({
    typeDefs: [rootSchema, ...schemaTypes],
    resolvers: catResolver,
    async context({ req }) {
      const user = await authenticate(req)
      return { user }
    }
  })

  await connect(config.dbUrl)
  const { url } = await server.listen({ port: config.port })

  console.log(`GQL server ready at ${url}`)
}
