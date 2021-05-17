import { BackendService } from '../backend.service';
import { ListViewDataSource } from './list-view-datasource';
import { of } from 'rxjs';

describe('ListViewComponent', () => {
  let dataSource: ListViewDataSource;
  let backend: BackendService;
  let mockUrl;
  let ticketSpy;


  describe('constructor', () => {
    beforeEach(() => {
      backend = new BackendService();
      ticketSpy = jest.spyOn(backend, 'tickets');
      mockUrl = of(['details', '1']);
      dataSource = new ListViewDataSource(mockUrl, backend);
    });
    it('hideCompleted should be false', () => {
      expect(dataSource.hideCompleted.getValue()).toEqual(false)
    })

    it('backend will be called for tickets', () => {
      expect(ticketSpy).toBeCalled();
    })

    it('dataSource.data will init as empty array', () => {
      expect(dataSource.data).toEqual([])
    })
  });
});
