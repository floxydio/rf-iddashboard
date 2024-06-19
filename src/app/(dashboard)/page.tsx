"use client"
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowDown,
  faArrowUp,
  faDownload,
  faEllipsisVertical,
  faMars,
  faSearch,
  faUsers,
  faVenus,
} from '@fortawesome/free-solid-svg-icons'
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ProgressBar,
  Table
} from 'react-bootstrap'
import {
  faCcAmex,
  faCcApplePay,
  faCcPaypal,
  faCcStripe,
  faCcVisa,
  faFacebookF,
  faLinkedinIn,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons'
import React, { useEffect, useState } from 'react'
import UserChart from '@/components/Page/Dashboard/UserChart'
import IncomeChart from '@/components/Page/Dashboard/IncomeChart'
import ConversionChart from '@/components/Page/Dashboard/ConversionChart'
import SessionChart from '@/components/Page/Dashboard/SessionChart'
import TrafficChart from '@/components/Page/Dashboard/TrafficChart'
import { getDictionary } from '@/locales/dictionary'
import axios from 'axios'
import Pagination from 'react-bootstrap/Pagination';

export interface RespBody {
  status: number
  data: RFDaum[]
  message: string
  page: number
  limit: number
  totalPage: number
  total: number
}

export interface RFDaum {
  id: number
  epc: string
  read_count: string
  created_at: string
}

//@ts-ignore
const Paginate = ({ totalPage, currentPage, setPage, fetchDataPagination }) => {
  const pageNeighbours = 2;

  const getPageNumbers = () => {
    const totalNumbers = pageNeighbours * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPage > totalBlocks) {
      const startPage = Math.max(2, currentPage - pageNeighbours);
      const endPage = Math.min(totalPage - 1, currentPage + pageNeighbours);

      let pages = [];
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      const hasLeftSpill = startPage > 2;
      const hasRightSpill = endPage < totalPage - 1;
      const spillOffset = totalNumbers - (pages.length + 1);

      switch (true) {
        case (hasLeftSpill && !hasRightSpill): {
          const extraPages = Array.from({ length: spillOffset }, (_, i) => startPage - spillOffset + i);
          pages = ['LEFT', ...extraPages, ...pages];
          break;
        }

        case (!hasLeftSpill && hasRightSpill): {
          const extraPages = Array.from({ length: spillOffset }, (_, i) => endPage + i + 1);
          pages = [...pages, ...extraPages, 'RIGHT'];
          break;
        }

        case (hasLeftSpill && hasRightSpill):
        default: {
          pages = ['LEFT', ...pages, 'RIGHT'];
          break;
        }
      }

      return [1, ...pages, totalPage];
    }

    return Array.from({ length: totalPage }, (_, i) => i + 1);
  };

  const handleMoveLeft = () => {
    setPage(currentPage - pageNeighbours * 2 - 1);
    fetchDataPagination();
  };

  const handleMoveRight = () => {
    setPage(currentPage + pageNeighbours * 2 + 1);
    fetchDataPagination();
  };

  const pages = getPageNumbers();

  return (
    <Pagination>
      <Pagination.First onClick={() => {
        setPage(1);
        fetchDataPagination();
      }} />
      <Pagination.Prev onClick={() => {
        if (currentPage > 1) {
          setPage(currentPage - 1);
          fetchDataPagination();
        }
      }} />
      {
        pages.map((page, index) => {
          if (page === 'LEFT') return <Pagination.Ellipsis key={index} onClick={handleMoveLeft} />;
          if (page === 'RIGHT') return <Pagination.Ellipsis key={index} onClick={handleMoveRight} />;
          return (
            <Pagination.Item key={index} active={page === currentPage} onClick={() => {
              setPage(page);
              fetchDataPagination();
            }}>
              {page}
            </Pagination.Item>
          );
        })
      }
      <Pagination.Next onClick={() => {
        if (currentPage < totalPage) {
          setPage(currentPage + 1);
          fetchDataPagination();
        }
      }} />
      <Pagination.Last onClick={() => {
        setPage(totalPage);
        fetchDataPagination();
      }} />
    </Pagination>
  );
};

export default function Page() {
  const [rfId, setRfId] = useState<RFDaum[]>([])
  const [page, setPage] = useState<number>(1)
  const [totalPage, setTotalPage] = useState<number>(1)

  const fetchDataPagination = async () => {
    await axios.get(`http://103.193.176.166:2500/rf/epc/find-dashboard?page=${Number(page)}&limit=20`).then((res) => {
      if (res.data.data) {
        setRfId(res.data.data)
        setTotalPage(res.data.totalPage)
      }
    }).catch((err) => {
      alert(err)
    })
  }

  useEffect(() => {
    fetchDataPagination()
  }, [page])

  return (
    <div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>EPC</th>
            <th>ReadCount</th>
          </tr>
        </thead>
        <tbody>
          {rfId.map((data) => {
            return (
              <tr key={data.id}>
                <td>{data.id}</td>
                <td>{data.epc}</td>
                <td>{data.read_count === "undefined" || data.read_count === "" ? "-" : data.read_count}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      <Paginate
        totalPage={totalPage}
        currentPage={page}
        setPage={setPage}
        fetchDataPagination={fetchDataPagination}
      />
    </div>
  )
}
