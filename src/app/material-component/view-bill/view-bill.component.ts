import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BillService } from 'src/app/services/bill.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { ViewBillProductsComponent } from '../dialog/view-bill-products/view-bill-products.component';
import { ConfirmationComponent } from '../dialog/confirmation/confirmation.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-view-bill',
  templateUrl: './view-bill.component.html',
  styleUrls: ['./view-bill.component.scss']
})
export class ViewBillComponent implements OnInit {

  dispyayedColumns : string[] = ['name','email','contactNumber','paymentMethod','total','view'];
  dataSource:any;
  responseMessage:any;

  constructor(private billService:BillService,
    private dialog:MatDialog,
    private snackbarService:SnackbarService,
    private router:Router
    ) { }
  ngOnInit(): void {
    this.tableData();

  }

  tableData(){
    this.billService.getBills().subscribe((response:any)=>{
      this.dataSource = new MatTableDataSource(response);
    },(error:any)=>{
      console.log(error.error?.message);
      if(error.error?.message){
         this.responseMessage = error.error?.message;   
      }else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    });
  }

  applyFilter(event:Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  handleViewAction(values:any){
    const dialogconfig = new MatDialogConfig();
    dialogconfig.data = {
      data:values
    } 

    dialogconfig.width = "100%";
    const dialogRef = this.dialog.open(ViewBillProductsComponent,dialogconfig);
    this.router.events.subscribe(() =>{
      dialogRef.close();
    })
  }

  handleDeleteAction(values:any){

    const dialogconfig = new MatDialogConfig();
    dialogconfig.data = {
      message: 'delete' + values.name + 'bill',
      confirmation:true
    };
    const dialogRef =  this.dialog.open(ConfirmationComponent,dialogconfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((response:any)=>{
      this.deleteBill(values.id);
      dialogRef.close();
    })

  }

  deleteBill(id:any){
    this.billService.delete(id).subscribe((response:any)=>{
      this.tableData();
      this.responseMessage = response?.message;
      this.snackbarService.openSnackBar(this.responseMessage,"success")
    },(error:any)=>{
      console.log(error.error?.message);
      if(error.error?.message){
         this.responseMessage = error.error?.message;   
      }else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    });
  }

  downloadReportAction(values:any){
    var data = {
      name: values.name,
      email: values.email,
      uuid: values.uuid,
      contactNumber: values.contactNumber,
      paymentMethod: values.paymentMethod,
      totalAmount: values.total.toString(),
      productDetails: values.productDetail
    }
    this.downloadFile(values.uuid,data);
  }

  downloadFile(fileName:string,data:any){
    this.billService.getPdf(data).subscribe((response:any)=>{
      saveAs(response,fileName+'.pdf');
      
    });
  }

}
