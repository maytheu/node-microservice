import Product from './product.model';
import { IProduct, IProductQuery } from './product.types';

class ProductService {
  private readonly regex = /\b(<|>|>=|=|<|>=)\b/g;

  newProduct = async (data: IProduct) => {
    try {
      return await Product.create(data);
    } catch (error) {
      return error;
    }
  };

  allProduct = async (
    query: { name: string; description: string },
    filter: string,
    limit: number,
    page: number
  ) => {
    try {
      const objQuery:any = {};
      if (query.name) objQuery.name = { $regex: name as string, $options: 'i' };
      if (query.description)
        objQuery.description = { $regex: description as string, $options: 'i' };

      if (filter) {
        let filters = filter.replace(
          this.regex,
          (match: string) => `-${this.operationMap[match]}-`)

          const options = ["price", "quantity"];
        // filters =
        filters.split(",").forEach((item) => {
          const [field, operator, value] = item.split("-");
          if (options.includes(field)) {
            objQuery[field] = { [operator]: +value };
          }
        });
        );
      }
    } catch (error) {
      return error;
    }
  };

  private readonly operationMap: any = {
    '>': '$gt',
    '>=': '$gte',
    '<': '$lt',
    '<=': '$lte',
    '=': '$eq',
  };
}
