export default function Twicas (client_id_or_token, client_secret) {
    if (!client_id_or_token) {
        throw Error('Twicas() needs more than one argument.')
    }

    if (client_secret) {
        const client_id = client_id_or_token
        const encoded = btoa(client_id + ':' + client_secret)
        this.auth = `Basic ${encoded}`
    } else {
        const token = client_id_or_token
        this.auth = `Bearer ${token}`
    }

    const base_url = 'https://apiv2.twitcasting.tv'
    
    function toQueryString (alist) {
        // 呼び出し側の責任で alist には1次元のObjectが渡される。
        // undefined は無視する。null は無視しない。
        const valueIsNotUndefined = ([key, value]) => value !== undefined
        const entries = Object.entries(alist).filter(valueIsNotUndefined)
        const queries = entries.map(key_value => key_value.join('='))
        const query_string = queries.join('&')
        return query_string
    }


    this.get = async function (path, options={}) {
        const query_string = toQueryString(options)
        const url = base_url + path + '?' + query_string
        const auth = this.auth

        const headers = {
            'Accept':'application/json',
            'X-Api-Version':'2.0',
            'Authorization':auth
        }
        const res = await fetch(url, { headers })
        return await res.json()
    }


    this.user = async function (user_id) {
        const path = '/users/' + user_id
        return await this.get(path)
    }

    /*
    offset	先頭からの位置	min:0	no (default:0)
    limit	取得件数(場合により、指定件数に満たない数のコメントを返す可能性があります)	min:1, max:50	no (default:10)
    slice_id	このコメントID以降のコメントを取得します。このパラメータを指定した場合はoffsetは無視されます。	min:1	no (default:none)
    */
    this.comments = async function (movie_id, options={}) {
        const path = '/movies/' + movie_id + '/comments'
        return await this.get(path, options)
    }

    this.liveComments = async function (user_id, options={}) {
        const user_res = await this.user(user_id)

        if (user_res.error) {
            return user_res
        }

        const { user } = user_res
        const last_movie_id = user.last_movie_id

        return await this.comments(last_movie_id, options)
    }
}