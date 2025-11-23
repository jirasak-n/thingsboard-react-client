import { ThingsboardClient } from '../ThingsboardClient';
import { Customer } from '../model/customer';
import { PageData, PageLink } from '../model/page';

export class CustomerService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async getCustomers(pageLink: PageLink): Promise<PageData<Customer>> {
        let url = `/api/customers?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<Customer>>(url);
    }

    public async getCustomer(customerId: string): Promise<Customer | null> {
        return this.tbClient.get<Customer>(`/api/customer/${customerId}`);
    }

    public async saveCustomer(customer: Customer): Promise<Customer> {
        return this.tbClient.post<Customer>('/api/customer', customer);
    }

    public async deleteCustomer(customerId: string): Promise<void> {
        return this.tbClient.delete(`/api/customer/${customerId}`);
    }
}
